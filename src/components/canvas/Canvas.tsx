import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useImperativeHandle
} from 'react';
import { Point, SvgPath, SvgPoint, SvgControlPoint, SvgItem } from '../../lib/svg';
import { Image } from '../../types/image';
import { Layer } from '../../types/layer';
import './Canvas.css';

export interface CanvasHandle {
  zoomViewPort: (scale: number, pt?: { x: number; y: number }) => void;
  getCanvasDimensions: () => { width: number; height: number };
}

export interface CanvasProps {
  parsedPath?: SvgPath;
  layers?: Layer[];
  activeLayerId?: string | null;
  onSelectLayer?: (id: string) => void;
  targetPoints: SvgPoint[];
  controlPoints: SvgControlPoint[];
  draggedPoint: SvgPoint | null;
  onDraggedPointChange: (pt: SvgPoint | null) => void;
  focusedItem: SvgItem | null;
  onFocusedItemChange: (item: SvgItem | null) => void;
  hoveredItem: SvgItem | null;
  onHoveredItemChange: (item: SvgItem | null) => void;
  wasCanvasDragged: boolean;
  onWasCanvasDraggedChange: (dragged: boolean) => void;
  draggedIsNew: boolean;
  decimals?: number;
  viewPortX: number;
  viewPortY: number;
  viewPortWidth: number;
  viewPortHeight: number;
  strokeWidth: number;
  preview: boolean;
  filled: boolean;
  renderColors?: boolean;
  showTicks: boolean;
  images: Image[];
  editImages: boolean;
  focusedImage: Image | null;
  onFocusedImageChange: (img: Image | null) => void;
  onAfterModelChange: () => void;
  onDragging: (dragging: boolean) => void;
  onViewPort: (vp: { x: number; y: number; w: number; h: number | null; force?: boolean }) => void;
  onHoverPosition: (pos?: { x: number; y: number }) => void;
  onCursorPosition: (pos?: { x: number; y: number; decimals?: number }) => void;
  onCanvasWidthChange: (w: number) => void;
  onCanvasHeightChange: (h: number) => void;
}

export const Canvas = React.forwardRef<CanvasHandle, CanvasProps>((props, ref) => {
  const {
    parsedPath,
    layers,
    activeLayerId,
    onSelectLayer,
    targetPoints,
    controlPoints,
    draggedPoint,
    onDraggedPointChange,
    focusedItem,
    onFocusedItemChange,
    hoveredItem,
    onHoveredItemChange,
    wasCanvasDragged,
    onWasCanvasDraggedChange,
    draggedIsNew,
    decimals = 3,
    viewPortX,
    viewPortY,
    viewPortWidth,
    viewPortHeight,
    strokeWidth,
    preview,
    filled,
    renderColors = true,
    showTicks,
    images,
    editImages,
    focusedImage,
    onFocusedImageChange,
    onAfterModelChange,
    onDragging,
    onViewPort,
    onHoverPosition,
    onCursorPosition,
    onCanvasWidthChange,
    onCanvasHeightChange
  } = props;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

  // Store latest props in ref so event handlers always read current values
  // (matches Angular's `this.viewPortX` etc. — always reads current mutable state)
  const stateRef = useRef({
    viewPortX,
    viewPortY,
    viewPortWidth,
    viewPortHeight,
    strokeWidth,
    decimals,
    draggedIsNew,
    parsedPath,
    onViewPort,
    onAfterModelChange,
    onCursorPosition,
    onHoverPosition,
    onDragging,
    onDraggedPointChange,
    onFocusedItemChange,
    onFocusedImageChange,
    onWasCanvasDraggedChange
  });

  // Synchronously update stateRef on each render
  stateRef.current.viewPortX = viewPortX;
  stateRef.current.viewPortY = viewPortY;
  stateRef.current.viewPortWidth = viewPortWidth;
  stateRef.current.viewPortHeight = viewPortHeight;
  stateRef.current.strokeWidth = strokeWidth;
  stateRef.current.decimals = decimals;
  stateRef.current.draggedIsNew = draggedIsNew;
  stateRef.current.parsedPath = parsedPath;
  stateRef.current.onViewPort = onViewPort;
  stateRef.current.onAfterModelChange = onAfterModelChange;
  stateRef.current.onCursorPosition = onCursorPosition;
  stateRef.current.onHoverPosition = onHoverPosition;
  stateRef.current.onDragging = onDragging;
  stateRef.current.onDraggedPointChange = onDraggedPointChange;
  stateRef.current.onFocusedItemChange = onFocusedItemChange;
  stateRef.current.onFocusedImageChange = onFocusedImageChange;
  stateRef.current.onWasCanvasDraggedChange = onWasCanvasDraggedChange;

  // Track canvas size with ResizeObserver
  const prevDimRef = useRef({ width: 0, height: 0 });
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (
          width > 0 &&
          height > 0 &&
          (Math.abs(width - prevDimRef.current.width) > 1 || Math.abs(height - prevDimRef.current.height) > 1)
        ) {
          prevDimRef.current = { width, height };
          setCanvasDimensions({ width, height });
          onCanvasWidthChange(width);
          onCanvasHeightChange(height);
          const computedH = (height * stateRef.current.viewPortWidth) / width;
          stateRef.current.onViewPort({
            x: stateRef.current.viewPortX,
            y: stateRef.current.viewPortY,
            w: stateRef.current.viewPortWidth,
            h: computedH,
            force: true
          });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [onCanvasWidthChange, onCanvasHeightChange]);

  // Convert mouse/touch event to SVG world coordinates
  // Matches Angular: viewPortX + (clientX - rect.left) * strokeWidth
  const eventToLocation = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const s = stateRef.current;
      const x = s.viewPortX + (clientX - rect.left) * s.strokeWidth;
      const y = s.viewPortY + (clientY - rect.top) * s.strokeWidth;
      return { x, y };
    },
    []
  );

  // Zoom viewport — matches Angular's zoomViewPort exactly
  const zoomViewPort = useCallback(
    (scale: number, pt?: { x: number; y: number }) => {
      const s = stateRef.current;
      if (!pt) {
        pt = {
          x: s.viewPortX + 0.5 * s.viewPortWidth,
          y: s.viewPortY + 0.5 * s.viewPortHeight
        };
      }
      const w = scale * s.viewPortWidth;
      const h = scale * s.viewPortHeight;
      const x = s.viewPortX + ((pt.x - s.viewPortX) - scale * (pt.x - s.viewPortX));
      const y = s.viewPortY + ((pt.y - s.viewPortY) - scale * (pt.y - s.viewPortY));

      s.onViewPort({ x, y, w, h });
    },
    []
  );

  // Expose imperative handle to parent
  useImperativeHandle(
    ref,
    () => ({
      zoomViewPort,
      getCanvasDimensions: () => canvasDimensions
    }),
    [zoomViewPort, canvasDimensions]
  );

  // Wheel event batching — matches Angular's RxJS throttleTime(20) + buffer pattern
  const wheelBufferRef = useRef<WheelEvent[]>([]);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const flushWheel = () => {
      wheelTimerRef.current = null;
      const events = wheelBufferRef.current;
      wheelBufferRef.current = [];
      if (events.length === 0) return;

      const cap = (val: number, max: number) => (val > max ? max : val < -max ? -max : val);
      const deltaY = events.reduce((acc, ev) => {
        let d = ev.deltaY;
        if (ev.deltaMode === 1) d *= 20;
        else if (ev.deltaMode === 2) d *= 100;
        return acc + cap(d, 50);
      }, 0);

      if (deltaY === 0) return;

      const scale = Math.pow(1.005, deltaY);
      const firstEvt = events[0];
      const pt = eventToLocation(firstEvt.clientX, firstEvt.clientY);
      zoomViewPort(scale, pt);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelBufferRef.current.push(e);

      if (wheelTimerRef.current === null) {
        wheelTimerRef.current = setTimeout(flushWheel, 20);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (wheelTimerRef.current !== null) {
        clearTimeout(wheelTimerRef.current);
      }
    };
  }, [eventToLocation, zoomViewPort]);

  // Drag state management — matches Angular's draggedEvt pattern
  const dragInfoRef = useRef<{
    isDragging: boolean;
    dragType: 'point' | 'canvas' | 'image' | null;
    point: SvgPoint | null;
    image: Image | null;
    imageMask: number;
    draggedEvt: MouseEvent | TouchEvent | null;
    dragWithoutClick: boolean;
  }>({
    isDragging: false,
    dragType: null,
    point: null,
    image: null,
    imageMask: 0,
    draggedEvt: null,
    dragWithoutClick: true
  });

  // Pinch-to-zoom — matches Angular's pinchToZoom exactly
  const pinchToZoom = useCallback(
    (previousEvent: TouchEvent, event: TouchEvent) => {
      if (previousEvent.touches.length >= 2 && event.touches.length >= 2) {
        const pt = eventToLocation(event.touches[0].clientX, event.touches[0].clientY);
        const pt2 = eventToLocation(event.touches[1].clientX, event.touches[1].clientY);
        const oriPt = eventToLocation(previousEvent.touches[0].clientX, previousEvent.touches[0].clientY);
        const oriPt2 = eventToLocation(previousEvent.touches[1].clientX, previousEvent.touches[1].clientY);

        const ptm = { x: 0.5 * (pt.x + pt2.x), y: 0.5 * (pt.y + pt2.y) };
        const oriPtm = { x: 0.5 * (oriPt.x + oriPt2.x), y: 0.5 * (oriPt.y + oriPt2.y) };
        const delta = { x: oriPtm.x - ptm.x, y: oriPtm.y - ptm.y };
        const k =
          Math.sqrt((oriPt.x - oriPt2.x) ** 2 + (oriPt.y - oriPt2.y) ** 2) /
          Math.sqrt((pt.x - pt2.x) ** 2 + (pt.y - pt2.y) ** 2);

        return { zoom: k, delta, center: ptm };
      }
      return null;
    },
    [eventToLocation]
  );

  // Attach window move and end listeners ONLY while dragging
  const startDragOperation = useCallback(() => {
    const handleWindowMove = (e: MouseEvent | TouchEvent) => {
      const info = dragInfoRef.current;
      if (!info.isDragging) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const pt = eventToLocation(clientX, clientY);

      stateRef.current.onHoverPosition(pt);

      // Check if mouse button released (Angular's dragWithoutClick check)
      if (!info.dragWithoutClick && e instanceof MouseEvent && e.buttons === 0) {
        handleWindowEnd();
        return;
      }

      e.stopPropagation();

      // Point Dragging — matches Angular
      if (info.dragType === 'point' && info.point && stateRef.current.parsedPath) {
        const dec = (e as MouseEvent).ctrlKey
          ? (stateRef.current.decimals ? 0 : 3)
          : stateRef.current.decimals;
        const x = parseFloat(pt.x.toFixed(dec));
        const y = parseFloat(pt.y.toFixed(dec));
        const newPt = new Point(x, y);

        stateRef.current.parsedPath.setLocation(info.point, newPt);

        if (stateRef.current.draggedIsNew) {
          const prevIdx = stateRef.current.parsedPath.path.indexOf(info.point.itemReference) - 1;
          if (prevIdx >= 0) {
            info.point.itemReference.resetControlPoints(stateRef.current.parsedPath.path[prevIdx]);
          }
        }

        stateRef.current.onAfterModelChange();
        info.draggedEvt = null;
        stateRef.current.onCursorPosition({ x, y, decimals: dec });
      }

      // Canvas Background Panning — matches Angular's oriPt/pt delta pattern
      else if (info.dragType === 'canvas' && info.draggedEvt) {
        stateRef.current.onWasCanvasDraggedChange(true);
        stateRef.current.onHoverPosition(undefined);

        // Pinch-to-zoom for touch
        if ('touches' in e && e.touches.length >= 2 && 'touches' in info.draggedEvt) {
          const pinch = pinchToZoom(info.draggedEvt as TouchEvent, e as TouchEvent);
          if (pinch !== null) {
            const s = stateRef.current;
            const w = pinch.zoom * s.viewPortWidth;
            const h = pinch.zoom * s.viewPortHeight;
            const x = s.viewPortX + pinch.delta.x + (pinch.center.x - s.viewPortX) * (1 - pinch.zoom);
            const y = s.viewPortY + pinch.delta.y + (pinch.center.y - s.viewPortY) * (1 - pinch.zoom);
            s.onViewPort({ x, y, w, h });
          }
        } else {
          // Simple pan: compute delta between previous and current event locations
          const prevClientX = 'touches' in info.draggedEvt
            ? (info.draggedEvt as TouchEvent).touches[0].clientX
            : (info.draggedEvt as MouseEvent).clientX;
          const prevClientY = 'touches' in info.draggedEvt
            ? (info.draggedEvt as TouchEvent).touches[0].clientY
            : (info.draggedEvt as MouseEvent).clientY;
          const oriPt = eventToLocation(prevClientX, prevClientY);

          const s = stateRef.current;
          s.onViewPort({
            x: s.viewPortX + (oriPt.x - pt.x),
            y: s.viewPortY + (oriPt.y - pt.y),
            w: s.viewPortWidth,
            h: s.viewPortHeight
          });
        }

        // Store current event for next frame's delta (Angular pattern)
        info.draggedEvt = e;
      }

      // Reference Image Dragging — matches Angular
      else if (info.dragType === 'image' && info.image && info.draggedEvt) {
        const prevClientX = 'touches' in info.draggedEvt
          ? (info.draggedEvt as TouchEvent).touches[0].clientX
          : (info.draggedEvt as MouseEvent).clientX;
        const prevClientY = 'touches' in info.draggedEvt
          ? (info.draggedEvt as TouchEvent).touches[0].clientY
          : (info.draggedEvt as MouseEvent).clientY;
        const oriPt = eventToLocation(prevClientX, prevClientY);
        const mask = info.imageMask;

        if (mask & 1) info.image.x1 += pt.x - oriPt.x;
        if (mask & 2) info.image.y1 += pt.y - oriPt.y;
        if (mask & 4) info.image.x2 += pt.x - oriPt.x;
        if (mask & 8) info.image.y2 += pt.y - oriPt.y;

        info.draggedEvt = e;
        stateRef.current.onAfterModelChange();
      }
    };

    const handleWindowEnd = () => {
      const info = dragInfoRef.current;
      if (info.isDragging) {
        stateRef.current.onDragging(false);

        if (!info.point && !wasCanvasDragged) {
          stateRef.current.onFocusedItemChange(null);
          stateRef.current.onCursorPosition(undefined);
        }
        if (!info.image && !wasCanvasDragged) {
          stateRef.current.onFocusedImageChange(null);
        }

        info.isDragging = false;
        info.dragType = null;
        info.point = null;
        info.image = null;
        info.draggedEvt = null;
        info.dragWithoutClick = true;
        stateRef.current.onDraggedPointChange(null);
      }

      window.removeEventListener('mousemove', handleWindowMove);
      window.removeEventListener('mouseup', handleWindowEnd);
      window.removeEventListener('touchmove', handleWindowMove);
      window.removeEventListener('touchend', handleWindowEnd);
    };

    window.addEventListener('mousemove', handleWindowMove);
    window.addEventListener('mouseup', handleWindowEnd);
    window.addEventListener('touchmove', handleWindowMove, { passive: false });
    window.addEventListener('touchend', handleWindowEnd);
  }, [eventToLocation, wasCanvasDragged, pinchToZoom]);

  // Start dragging a target or control point
  const startDragPoint = (pt: SvgPoint, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    onDragging(true);
    onDraggedPointChange(pt);
    onCursorPosition({ ...pt, decimals });

    if (pt.itemReference.getType().toLowerCase() !== 'z') {
      onFocusedItemChange(pt.itemReference);
    }

    const nativeEvt = e.nativeEvent;

    dragInfoRef.current = {
      isDragging: true,
      dragType: 'point',
      point: pt,
      image: null,
      imageMask: 0,
      draggedEvt: nativeEvt,
      dragWithoutClick: false
    };

    startDragOperation();
  };

  // Start dragging canvas background — matches Angular's startDragCanvas
  const startDragCanvas = (e: React.MouseEvent | React.TouchEvent) => {
    onWasCanvasDraggedChange(false);
    const nativeEvt = e.nativeEvent;

    dragInfoRef.current = {
      isDragging: true,
      dragType: 'canvas',
      point: null,
      image: null,
      imageMask: 0,
      draggedEvt: nativeEvt,
      dragWithoutClick: false
    };

    startDragOperation();
  };

  // Start dragging an image or its resize handles
  const startDragImage = (e: React.MouseEvent | React.TouchEvent, im: Image, mask: number) => {
    e.stopPropagation();
    onDragging(true);
    onFocusedImageChange(im);
    const nativeEvt = e.nativeEvent;

    dragInfoRef.current = {
      isDragging: true,
      dragType: 'image',
      point: null,
      image: im,
      imageMask: mask,
      draggedEvt: nativeEvt,
      dragWithoutClick: false
    };

    startDragOperation();
  };

  // Hover position when moving over canvas (while not dragging)
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragInfoRef.current.isDragging) {
      const pt = eventToLocation(e.clientX, e.clientY);
      onHoverPosition(pt);
    }
  };

  const handleCanvasMouseLeave = () => {
    if (!dragInfoRef.current.isDragging) {
      onHoverPosition(undefined);
    }
  };

  // Dynamic grid calculation — uses props directly (single source of truth like Angular)
  const { xGrid, yGrid, xGridSecondary, yGridSecondary } = useMemo(() => {
    const roundVal = (v: number) => Math.round(v * 1e10) / 1e10;
    const minPx = 10;
    const raw = canvasDimensions.width > 0 ? (minPx * viewPortWidth) / canvasDimensions.width : 1;
    const e = Math.ceil(Math.log10(Math.max(raw, 1e-10)));

    let step = Math.pow(10, Math.max(e, -4));
    if (!showTicks) {
      step = Math.max(step, 1);
    }
    const xStart = Math.floor(viewPortX / step) * step;
    const xCount = Math.ceil(viewPortWidth / step) + 2;
    const xG = Array.from({ length: Math.min(xCount, 200) }, (_, i) => roundVal(xStart + i * step));

    const yStart = Math.floor(viewPortY / step) * step;
    const yCount = Math.ceil(viewPortHeight / step) + 2;
    const yG = Array.from({ length: Math.min(yCount, 200) }, (_, i) => roundVal(yStart + i * step));

    let xSec: number[] = [];
    let ySec: number[] = [];

    if (showTicks) {
      const secStep = (step < 1 ? 10 : 5) * step;
      const xSecStart = Math.floor(viewPortX / secStep) * secStep;
      const xSecCount = Math.ceil(viewPortWidth / secStep) + 2;
      xSec = Array.from({ length: Math.min(xSecCount, 100) }, (_, i) => roundVal(xSecStart + i * secStep));

      const ySecStart = Math.floor(viewPortY / secStep) * secStep;
      const ySecCount = Math.ceil(viewPortHeight / secStep) + 2;
      ySec = Array.from({ length: Math.min(ySecCount, 100) }, (_, i) => roundVal(ySecStart + i * secStep));
    }

    return { xGrid: xG, yGrid: yG, xGridSecondary: xSec, yGridSecondary: ySec };
  }, [canvasDimensions.width, viewPortX, viewPortY, viewPortWidth, viewPortHeight, showTicks]);

  return (
    <svg
      ref={svgRef}
      className={`canvas-svg ${preview ? 'preview' : ''}`}
      viewBox={`${viewPortX} ${viewPortY} ${viewPortWidth} ${viewPortHeight}`}
      onMouseDown={startDragCanvas}
      onTouchStart={startDragCanvas}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={handleCanvasMouseLeave}
      onClick={() => onHoveredItemChange(null)}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      {strokeWidth > 0 && (
        <>
          {/* Grid lines */}
          {xGrid.map((x, idx) => (
            <rect
              key={`xg_${idx}`}
              className="grid"
              x={x - 0.5 * strokeWidth}
              y={viewPortY}
              width={strokeWidth}
              height={viewPortHeight}
            />
          ))}
          {yGrid.map((y, idx) => (
            <rect
              key={`yg_${idx}`}
              className="grid"
              x={viewPortX}
              y={y - 0.5 * strokeWidth}
              width={viewPortWidth}
              height={strokeWidth}
            />
          ))}

          {/* Secondary tick grid lines */}
          {xGridSecondary.map((x, idx) => (
            <rect
              key={`xgs_${idx}`}
              className="grid tick"
              x={x - 0.5 * strokeWidth}
              y={viewPortY}
              width={strokeWidth}
              height={viewPortHeight}
            />
          ))}
          {yGridSecondary.map((y, idx) => (
            <rect
              key={`ygs_${idx}`}
              className="grid tick"
              x={viewPortX}
              y={y - 0.5 * strokeWidth}
              width={viewPortWidth}
              height={strokeWidth}
            />
          ))}

          {/* Coordinate axes */}
          <rect
            className={`grid ${showTicks ? 'tick' : ''}`}
            x={viewPortX}
            y={-2 * strokeWidth}
            width={viewPortWidth}
            height={4 * strokeWidth}
          />
          <rect
            className={`grid ${showTicks ? 'tick' : ''}`}
            x={-2 * strokeWidth}
            y={viewPortY}
            width={4 * strokeWidth}
            height={viewPortHeight}
          />

          {/* Axis numeric labels */}
          {!preview && showTicks && (
            <>
              {yGridSecondary.map((y, idx) => (
                <text
                  key={`ytick_${idx}`}
                  className="tick"
                  x={-4 * strokeWidth}
                  y={y - 4 * strokeWidth}
                  style={{ fontSize: `${strokeWidth * 14}px` }}
                >
                  {y}
                </text>
              ))}
              {xGridSecondary.map((x, idx) =>
                x !== 0 ? (
                  <text
                    key={`xtick_${idx}`}
                    className="tick"
                    x={x - 4 * strokeWidth}
                    y={-4 * strokeWidth}
                    style={{ fontSize: `${strokeWidth * 14}px` }}
                  >
                    {x}
                  </text>
                ) : null
              )}
            </>
          )}

          {/* Reference images */}
          {!preview &&
            images.map((im, idx) => (
              <image
                key={`img_${idx}`}
                xlinkHref={im.data}
                href={im.data}
                x={Math.min(im.x1, im.x2)}
                y={Math.min(im.y1, im.y2)}
                width={Math.abs(im.x2 - im.x1)}
                height={Math.abs(im.y1 - im.y2)}
                preserveAspectRatio={im.preserveAspectRatio ? 'xMidYMid meet' : 'none'}
                style={{ opacity: im.opacity }}
              />
            ))}

          {/* Multi-layer SVG rendering */}
          {layers && layers.length > 0 ? (
            layers.map(function renderLayer(layer: Layer) {
              if (!layer.visible) return null;

              if (layer.type === 'group') {
                return (
                  <g
                    key={`g_${layer.id}`}
                    id={`g_${layer.id}`}
                    transform={layer.transform}
                    opacity={layer.opacity}
                  >
                    {layer.children?.map(renderLayer)}
                  </g>
                );
              }

              const isActive = layer.id === activeLayerId;
              const pathD = isActive ? (parsedPath?.asString() || layer.d) : layer.d;
              if (!pathD) return null;

              let layerFill = 'none';
              let layerStroke = '#ffffff';

              if (renderColors) {
                // Color mode: render actual SVG fill and stroke
                if (layer.fill && layer.fill.toLowerCase() !== 'none') {
                  layerFill = layer.fill;
                } else if (isActive && filled) {
                  layerFill = 'rgba(33, 150, 243, 0.35)';
                }

                if (layer.stroke && layer.stroke.toLowerCase() !== 'none') {
                  layerStroke = layer.stroke;
                } else if (isActive) {
                  layerStroke = '#ffffff';
                } else if (!layer.fill || layer.fill.toLowerCase() === 'none') {
                  layerStroke = 'rgba(255, 255, 255, 0.7)';
                } else {
                  layerStroke = 'none';
                }
              } else {
                // Wireframe mode: outline only, no fills
                layerFill = isActive && filled ? 'rgba(33, 150, 243, 0.2)' : 'none';
                layerStroke = isActive ? '#00bcd4' : 'rgba(255, 255, 255, 0.6)';
              }

              const actualStrokeWidth =
                layer.strokeWidth !== undefined ? layer.strokeWidth * strokeWidth : strokeWidth;

              return (
                <path
                  key={`layer_${layer.id}`}
                  id={`layer_${layer.id}`}
                  data-layer={layer.id}
                  className={`layer-path ${isActive ? 'active-layer' : 'inactive-layer'} ${!layer.locked ? 'selectable' : ''}`}
                  d={pathD}
                  fill={layerFill}
                  stroke={layerStroke}
                  strokeWidth={actualStrokeWidth}
                  opacity={layer.opacity}
                  transform={layer.transform}
                  style={{
                    fill: layerFill,
                    stroke: layerStroke,
                    strokeWidth: actualStrokeWidth,
                    cursor: !layer.locked ? 'pointer' : 'default',
                    pointerEvents: layer.locked ? 'none' : 'auto'
                  }}
                  onClick={e => {
                    if (!layer.locked && onSelectLayer && !isActive) {
                      e.stopPropagation();
                      onSelectLayer(layer.id);
                    }
                  }}
                />
              );
            })
          ) : (
            /* Primary SVG path fallback */
            <path
              className={`canvas-path standalone-path ${filled ? 'filled' : ''}`}
              d={parsedPath?.asString() || ''}
              strokeWidth={strokeWidth}
            />
          )}

          {/* Normal editing mode */}
          {!editImages && (
            <>
              {/* Bézier control lines */}
              {controlPoints.map((loc, idx) =>
                loc.relations.map((rel, relIdx) => (
                  <line
                    key={`cline_${idx}_${relIdx}`}
                    className="control"
                    x1={loc.x}
                    y1={loc.y}
                    x2={rel.x}
                    y2={rel.y}
                    strokeWidth={strokeWidth}
                  />
                ))
              )}

              {/* Hovered item path segment highlight */}
              {hoveredItem && !draggedPoint && !preview && (
                <path
                  d={hoveredItem.asStandaloneString()}
                  strokeWidth={strokeWidth}
                  className="canvas-path hovered"
                />
              )}

              {/* Focused item path segment highlight */}
              {focusedItem && !preview && (
                <path
                  d={focusedItem.asStandaloneString()}
                  strokeWidth={strokeWidth}
                  className="canvas-path dragged"
                />
              )}

              {/* Target point handles */}
              {targetPoints.map((loc, idx) =>
                loc.movable ? (
                  <circle
                    key={`tpt_${idx}`}
                    className={`target ${loc.itemReference === hoveredItem && !draggedPoint ? 'hovered' : ''} ${
                      loc.itemReference === focusedItem ? 'dragged' : ''
                    }`}
                    cx={loc.x}
                    cy={loc.y}
                    r={3 * strokeWidth}
                    strokeWidth={12 * strokeWidth}
                    onMouseDown={e => startDragPoint(loc, e)}
                    onTouchStart={e => startDragPoint(loc, e)}
                    onMouseEnter={e => {
                      onHoveredItemChange(loc.itemReference);
                      e.stopPropagation();
                    }}
                    onMouseLeave={() => onHoveredItemChange(null)}
                  />
                ) : null
              )}

              {/* Control point handles */}
              {controlPoints.map((loc, idx) =>
                loc.movable ? (
                  <circle
                    key={`cpt_${idx}`}
                    className={`control ${loc.itemReference === hoveredItem && !draggedPoint ? 'hovered' : ''} ${
                      loc.itemReference === focusedItem ? 'dragged' : ''
                    }`}
                    cx={loc.x}
                    cy={loc.y}
                    r={3 * strokeWidth}
                    strokeWidth={12 * strokeWidth}
                    onMouseDown={e => startDragPoint(loc, e)}
                    onTouchStart={e => startDragPoint(loc, e)}
                    onMouseEnter={e => {
                      onHoveredItemChange(loc.itemReference);
                      e.stopPropagation();
                    }}
                    onMouseLeave={() => onHoveredItemChange(null)}
                  />
                ) : null
              )}
            </>
          )}

          {/* Image manipulation handles */}
          {editImages &&
            !preview &&
            images.map((im, idx) => {
              const isFocused = im === focusedImage;
              return (
                <g key={`im_ctrl_${idx}`} className={isFocused ? 'focused-image' : ''}>
                  {/* Body move area */}
                  <rect
                    className="image-control move"
                    x={Math.min(im.x1, im.x2)}
                    y={Math.min(im.y1, im.y2)}
                    width={Math.abs(im.x2 - im.x1)}
                    height={Math.abs(im.y1 - im.y2)}
                    onMouseDown={e => startDragImage(e, im, 1 + 2 + 4 + 8)}
                    onTouchStart={e => startDragImage(e, im, 1 + 2 + 4 + 8)}
                  />
                  {/* Left edge */}
                  <line
                    className="image-control vertical"
                    x1={im.x1}
                    y1={im.y1}
                    x2={im.x1}
                    y2={im.y2}
                    strokeWidth={6 * strokeWidth}
                    onMouseDown={e => startDragImage(e, im, 1)}
                    onTouchStart={e => startDragImage(e, im, 1)}
                  />
                  {/* Top edge */}
                  <line
                    className="image-control horizontal"
                    x1={im.x1}
                    y1={im.y1}
                    x2={im.x2}
                    y2={im.y1}
                    strokeWidth={6 * strokeWidth}
                    onMouseDown={e => startDragImage(e, im, 2)}
                    onTouchStart={e => startDragImage(e, im, 2)}
                  />
                  {/* Bottom edge */}
                  <line
                    className="image-control horizontal"
                    x1={im.x1}
                    y1={im.y2}
                    x2={im.x2}
                    y2={im.y2}
                    strokeWidth={6 * strokeWidth}
                    onMouseDown={e => startDragImage(e, im, 8)}
                    onTouchStart={e => startDragImage(e, im, 8)}
                  />
                  {/* Right edge */}
                  <line
                    className="image-control vertical"
                    x1={im.x2}
                    y1={im.y1}
                    x2={im.x2}
                    y2={im.y2}
                    strokeWidth={6 * strokeWidth}
                    onMouseDown={e => startDragImage(e, im, 4)}
                    onTouchStart={e => startDragImage(e, im, 4)}
                  />
                  {/* Corners */}
                  <circle
                    className="image-control down"
                    cx={im.x1}
                    cy={im.y1}
                    r={3 * strokeWidth}
                    strokeWidth={24 * strokeWidth}
                    onMouseDown={e => startDragImage(e, im, 1 + 2)}
                    onTouchStart={e => startDragImage(e, im, 1 + 2)}
                  />
                  <circle
                    className="image-control up"
                    cx={im.x2}
                    cy={im.y1}
                    r={3 * strokeWidth}
                    strokeWidth={24 * strokeWidth}
                    onMouseDown={e => startDragImage(e, im, 2 + 4)}
                    onTouchStart={e => startDragImage(e, im, 2 + 4)}
                  />
                  <circle
                    className="image-control up"
                    cx={im.x1}
                    cy={im.y2}
                    r={3 * strokeWidth}
                    strokeWidth={24 * strokeWidth}
                    onMouseDown={e => startDragImage(e, im, 1 + 8)}
                    onTouchStart={e => startDragImage(e, im, 1 + 8)}
                  />
                  <circle
                    className="image-control down"
                    cx={im.x2}
                    cy={im.y2}
                    r={3 * strokeWidth}
                    strokeWidth={24 * strokeWidth}
                    onMouseDown={e => startDragImage(e, im, 4 + 8)}
                    onTouchStart={e => startDragImage(e, im, 4 + 8)}
                  />
                </g>
              );
            })}
        </>
      )}
    </svg>
  );
});

Canvas.displayName = 'Canvas';
