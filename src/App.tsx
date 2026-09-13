import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SvgPath, SvgItem, Point, SvgPoint, SvgControlPoint } from './lib/svg';
import type { SvgCommandType, SvgCommandTypeAny } from './lib/svg-command-types';
import { reversePath } from './lib/reverse-path';
import { optimizePath } from './lib/optimize-path';
import { changePathOrigin } from './lib/change-path-origin';
import { browserComputePathBoundingBox, computeDocumentBoundingBox } from './utils/svg-bbox';
import { storageService } from './services/storage.service';
import {
  EditorConfig,
  loadEditorConfig,
  saveEditorConfigProp
} from './services/config.service';
import { Image } from './types/image';
import { KEYBOARD } from './constants/keyboard.const';

import { Canvas, CanvasHandle } from './components/canvas/Canvas';
import { Sidebar } from './components/sidebar/Sidebar';
import { Toast } from './components/common/Toast';
import { ContextMenu, MenuItem } from './components/common/ContextMenu';
import { OpenDialog } from './components/dialogs/OpenDialog';
import { SaveDialog } from './components/dialogs/SaveDialog';
import { ExportDialog } from './components/dialogs/ExportDialog';
import { ShareDialog } from './components/dialogs/ShareDialog';
import { ImportDialog } from './components/dialogs/ImportDialog';
import { UploadImageDialog } from './components/dialogs/UploadImageDialog';
import { ImportSvgDialog } from './components/dialogs/ImportSvgDialog';
import { AboutDialog } from './components/dialogs/AboutDialog';
import { StartupDialog } from './components/dialogs/StartupDialog';
import { SvgSampleItem } from './constants/samples.const';
import { STORAGE } from './constants/storage.const';
import { LayersSidebar } from './components/sidebar/LayersSidebar';
import { Layer, SvgDocument } from './types/layer';
import { parseSvg } from './lib/svg-parser';
import { decodeShareHash, DecodedShareResult } from './utils/share-url';

import {
  Undo2,
  Redo2,
  Image as ImageIcon,
  Plus,
  Share2,
  Download,
  Grid,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Trash2,
  RefreshCw,
  ArrowUpToLine,
  ArrowUpDown,
  Layers as LayersIcon,
  Palette,
  Sparkles
} from 'lucide-react';

export const kDefaultSvg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n` +
  `  <style type="text/css">.cls-0 {fill:#1671F8;}\n` +
  `.cls-1 {fill:#4490FC;}</style>\n` +
  `  <path class="cls-0" d="m78.5 8c-4.9-3.6-10.4-6.4-18.5-6.4-3.6 0-8.9 0.7-13.2 2.5s-12.2 6.1-15.8 8-5.1 3.2-6.6 4.2c-1.4 1.1-3.4 2.7-5.9 5.3-1.5 1.8-3.1 3.8-4.1 5.6-1.2 2.2-2.4 5.2-2.4 5.7-0.7 2.5-1.4 5.5-1.4 9.1 0 2.9 0.6 7.9 3.3 12.4 3.5 5.2 7.1 7.5 10.2 9l9.9 5 5.9 3c1.7 1 3.2 1.7 6 1.7 1.8-0.1 3-0.7 4.1-1.2l6.9-2.9 7.3-4c4.9-2.1 3.7-6.9 0.8-9.2-1.4-1.1-4.3-3-6.8-2.3l-2.2 1-2.4 1.2c-1.7 0.8-3.6 1.4-5.8 1.4-3.3 0-5.2-0.9-6.8-1.6l-3.8-1.8c-5.1-2.5-7.6-3.3-10.5-7-0.5-0.8-1.1-1.8-1.4-2.7-0.9-3-0.7-6 0.9-9.4 1.9-3.1 3.6-4.5 7.3-6.6 1.4-0.5 3.1-1.4 4.5-2.1 1.1-0.5 2.5-1.2 3.6-1.8 1.3-0.6 2.8-1.3 4-2 1.8-0.9 3.3-1.7 5.3-2.7 2.1-1 4.5-1.6 7-1.6 2.7 0 4.7 0.6 7.5 2.1l5.2 3.2 6.4 4.1 3.4 2.3c0.9 0.6 1.1 0.5 2-0.6l1.5-1.5 1.6-1.9c0.6-0.5 1.2-1.5 2-2.3 1-1 2.1-3.3 0.4-5.6-1.8-2.5-4.9-6.1-9.4-9.6z"/>\n` +
  `  <path class="cls-0" d="m86.2 44.9c-1.6-2.5-4.6-5.9-7.8-8-3.5-2.2-10.7-6.2-14.5-8.4-1.7-0.8-3.4-1-4.9-1-1.3 0-2.8 0.5-3 0.6l-3.8 1.7-1.2 0.6-3.8 1.6-2.7 1.4-3.6 1.7c-2.5 1.3-4.9 1.9-5.9 3.6-0.6 1.2-0.8 3.4 1.7 4.8 1.9 0.9 2.3 1.1 9.4 4.6 0.5 0.3 0.9 0 1.3-0.2l5.6-2.9c1.6-0.8 4-1.4 5.9-1.4 1.5 0 2.6 0.1 4.3 0.6 3.3 1 5.9 2.4 8.3 4.5h0.1l2 2 0.6 0.8c0.8 1 1.9 2.9 2.2 4 0.7 1.9 1 3.5 0.9 6.1-0.2 2.4-1.1 5.3-2.8 7.4-0.6 1-1.5 1.6-2.3 3.1-1 0.5-3.5 1.9-4.2 2.1l-6.1 2.5-3.9 1.5c-1.5 0.8-4.5 1.8-5.4 2.3-2.4 0.9-5 1.5-7.6 1.4-4.5 0-7-1.4-10.6-3.4l-15.3-9.4c-0.7-0.5-1.2-0.4-2 0.4l-5.1 4.4-1.8 1.6c-1.2 1.1-1.7 2-1.6 3.5 0 1.9 1.9 3.6 3.4 5.4 2.2 2.3 4.5 4.6 7.6 6.8 4.6 3.2 11.6 7.2 22 7.2 4.3 0 8.4-0.5 14-2.3 3.9-1.4 12-4.4 18-7.2 4.4-2.3 7.8-4.5 10.6-7.9s6.2-9 7.1-17.1c0.4-6.3-1.1-13.7-5.1-19z"/>\n` +
  `  <path class="cls-1" d="m78.5 8.1-13.1 11.6 5.1 3.4 9.9 6.4c0.6 0.5 1.1 0.6 1.8-0.4l2.3-2.2 3.6-4.2c0.8-1.6 1.3-3.1-0.5-5.3-2.1-2.9-6-7.2-9.1-9.3zm-58.9 83.1 14.7-12.8-15.2-9.3c-0.7-0.5-1.2-0.5-2 0.4l-7.1 6.1c-1.1 1-1.5 1.9-1.4 3.4-0.1 1.7 1.9 3.6 3.4 5.2 2 2.3 4.9 5 7.6 7z"/>\n` +
  `</svg>`;

const defaultParsedDoc = parseSvg(kDefaultSvg);
export const kDefaultLayers: Layer[] = defaultParsedDoc.layers;
export const kDefaultPath = kDefaultLayers[0]?.d || '';
export const kDefaultViewBox = defaultParsedDoc.viewBox;

export function createDefaultLayers(): Layer[] {
  return JSON.parse(JSON.stringify(kDefaultLayers));
}

const kOldSVGEditoSnippet = 'M 4 8 L 10 1';
function isOldSVGEditoSession(saved?: { path?: string; layers?: Layer[] } | null): boolean {
  if (!saved) return false;
  if (saved.path && saved.path.includes(kOldSVGEditoSnippet)) return true;
  if (saved.layers && saved.layers.some(l => l.d && l.d.includes(kOldSVGEditoSnippet))) return true;
  return false;
}

export { computeDocumentBoundingBox } from './utils/svg-bbox';

export const App: React.FC = () => {
  // Config state
  const [config, setConfig] = useState<EditorConfig>(() => loadEditorConfig());

  // Path data state
  const [rawPath, setRawPath] = useState<string>(() => {
    const saved = storageService.getPath();
    if (!saved || isOldSVGEditoSession(saved)) {
      return kDefaultPath;
    }
    return saved.path || kDefaultPath;
  });
  const [pathName, setPathName] = useState<string>('');
  const [invalidSyntax, setInvalidSyntax] = useState<boolean>(false);

  // SVG Model state
  const [parsedPath, setParsedPath] = useState<SvgPath>(() => {
    try {
      return new SvgPath(rawPath);
    } catch {
      return new SvgPath('');
    }
  });

  const [targetPoints, setTargetPoints] = useState<SvgPoint[]>([]);
  const [controlPoints, setControlPoints] = useState<SvgControlPoint[]>([]);

  // Selection and drag states
  const [draggedPoint, setDraggedPoint] = useState<SvgPoint | null>(null);
  const [focusedItem, setFocusedItem] = useState<SvgItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<SvgItem | null>(null);
  const [wasCanvasDragged, setWasCanvasDragged] = useState<boolean>(false);
  const [draggedIsNew, setDraggedIsNew] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Cursor & Hover status
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number; decimals?: number } | undefined>();
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | undefined>();

  // Canvas size with real refs for immediate synchronous updates
  const [canvasWidth, setCanvasWidth] = useState<number>(100);
  const [canvasHeight, setCanvasHeight] = useState<number>(100);
  const canvasWidthRef = useRef<number>(100);
  const canvasHeightRef = useRef<number>(100);

  const handleCanvasWidthChange = useCallback((w: number) => {
    canvasWidthRef.current = w;
    setCanvasWidth(w);
  }, []);

  const handleCanvasHeightChange = useCallback((h: number) => {
    canvasHeightRef.current = h;
    setCanvasHeight(h);
  }, []);

  // History (undo / redo)
  const [history, setHistory] = useState<string[]>([rawPath]);
  const [historyCursor, setHistoryCursor] = useState<number>(0);
  const historyDisabledRef = useRef<boolean>(false);

  // Reference Images
  const [images, setImages] = useState<Image[]>([]);
  const [focusedImage, setFocusedImage] = useState<Image | null>(null);
  const [isEditingImages, setIsEditingImages] = useState<boolean>(false);

  // UI Panels & Modals - right panel restored from config.showLayersPanel
  const [isLeftPanelOpened, setIsLeftPanelOpened] = useState<boolean>(true);
  const [isRightPanelOpened, setIsRightPanelOpened] = useState<boolean>(() => config.showLayersPanel);
  const [isOpenDialogOpen, setIsOpenDialogOpen] = useState<boolean>(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState<boolean>(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false);
  const [isUploadImageDialogOpen, setIsUploadImageDialogOpen] = useState<boolean>(false);
  const [isImportSvgDialogOpen, setIsImportSvgDialogOpen] = useState<boolean>(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState<boolean>(false);
  const [isStartupDialogOpen, setIsStartupDialogOpen] = useState<boolean>(false);
  const [importUrlPath, setImportUrlPath] = useState<string>('');
  const [pendingShareImport, setPendingShareImport] = useState<DecodedShareResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync right panel with config
  useEffect(() => {
    setIsRightPanelOpened(config.showLayersPanel);
  }, [config.showLayersPanel]);

  // Layers state - restored from storageService if saved session has layers
  const [layers, setLayers] = useState<Layer[]>(() => {
    const saved = storageService.getPath();
    if (saved?.layers && saved.layers.length > 0 && !isOldSVGEditoSession(saved)) {
      return saved.layers;
    }
    return createDefaultLayers();
  });
  const [activeLayerId, setActiveLayerId] = useState<string>(() => {
    const saved = storageService.getPath();
    if (saved?.layers && saved.layers.length > 0 && !isOldSVGEditoSession(saved)) {
      const first = saved.layers.find(l => l.type !== 'group' && l.d) || saved.layers[0];
      return first.id;
    }
    return kDefaultLayers[0]?.id || 'layer_1';
  });
  const activeLayerIdRef = useRef<string>(activeLayerId);
  activeLayerIdRef.current = activeLayerId;

  // Intrinsic document viewBox (independent of canvas zoom/pan)
  const [docViewBox, setDocViewBox] = useState<{ x: number; y: number; width: number; height: number }>(() => {
    const saved = storageService.getPath();
    if (saved?.docViewBox && saved.docViewBox.width > 0 && !isOldSVGEditoSession(saved)) {
      return saved.docViewBox;
    }
    return kDefaultViewBox;
  });
  const docViewBoxRef = useRef<{ x: number; y: number; width: number; height: number }>(docViewBox);
  docViewBoxRef.current = docViewBox;

  // Context Menus
  const [insertMenu, setInsertMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    afterItem: SvgItem | null;
    convert: boolean;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    afterItem: null,
    convert: false
  });

  const [itemMenu, setItemMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    item: SvgItem | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    item: null
  });

  const [imageMenu, setImageMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    image: Image | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    image: null
  });

  const canvasRef = useRef<CanvasHandle | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const strokeWidth = canvasWidth > 0 ? config.viewPortWidth / canvasWidth : 1;
  const decimals = config.snapToGrid ? 0 : config.decimalPrecision;

  // Show temporary toast notification
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  // Update config property and persist to localStorage
  const handleConfigChange = useCallback(<K extends keyof EditorConfig>(key: K, val: EditorConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    saveEditorConfigProp(key, val);
  }, []);

  const layersRef = useRef<Layer[]>(layers);
  layersRef.current = layers;

  // Toggle right panel and persist to config
  const handleToggleRightPanel = useCallback(() => {
    setIsRightPanelOpened(prev => {
      const next = !prev;
      handleConfigChange('showLayersPanel', next);
      return next;
    });
  }, [handleConfigChange]);

  // Update viewport geometry — matches Angular's updateViewPort with toPrecision
  const updateViewPort = useCallback(
    (x: number, y: number, w: number | null, h: number | null, force = false) => {
      if (!force && config.viewPortLocked) return;

      const cw = canvasWidthRef.current > 0 ? canvasWidthRef.current : canvasWidth;
      const ch = canvasHeightRef.current > 0 ? canvasHeightRef.current : canvasHeight;

      let finalW = w;
      let finalH = h;
      if (finalW === null && finalH !== null && ch > 0) {
        finalW = (cw * finalH) / ch;
      }
      if (finalH === null && finalW !== null && cw > 0) {
        finalH = (ch * finalW) / cw;
      }
      if (!finalW || !finalH) return;

      // Use toPrecision (not toFixed) to match Angular — preserves significant digits
      const vx = parseFloat((1 * x).toPrecision(6));
      const vy = parseFloat((1 * y).toPrecision(6));
      const vw = parseFloat((1 * finalW).toPrecision(4));
      const vh = parseFloat((1 * finalH).toPrecision(4));

      setConfig(prev => ({
        ...prev,
        viewPortX: vx,
        viewPortY: vy,
        viewPortWidth: vw,
        viewPortHeight: vh
      }));

      // Debounce saving to localStorage to prevent blocking the UI during zoom and pan
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveEditorConfigProp('viewPortX', vx);
        saveEditorConfigProp('viewPortY', vy);
        saveEditorConfigProp('viewPortWidth', vw);
        saveEditorConfigProp('viewPortHeight', vh);
      }, 300);
    },
    [config.viewPortLocked, canvasWidth, canvasHeight]
  );

  // Zoom to auto fit current bounding box
  const zoomAuto = useCallback(() => {
    if (config.viewPortLocked) return;
    const cw = canvasWidthRef.current > 0 ? canvasWidthRef.current : canvasWidth;
    const ch = canvasHeightRef.current > 0 ? canvasHeightRef.current : canvasHeight;
    const currentLayers = layersRef.current;

    let bbox: { x: number; y: number; width: number; height: number };
    if (currentLayers && currentLayers.length > 1) {
      bbox = computeDocumentBoundingBox(currentLayers);
    } else {
      bbox = browserComputePathBoundingBox(rawPath);
    }

    const k = ch / (cw || 1);
    let w = Math.max(bbox.width + 4, 4);
    let h = Math.max(bbox.height + 4, 4);
    if (k < h / w) {
      w = h / k;
    } else {
      h = k * w;
    }
    const padX = (w - bbox.width) / 2;
    const padY = (h - bbox.height) / 2;
    updateViewPort(bbox.x - padX, bbox.y - padY, w, h);
  }, [config.viewPortLocked, rawPath, canvasWidth, canvasHeight, updateViewPort]);

  // Reload points from SvgPath
  const reloadPoints = useCallback((pathObj: SvgPath) => {
    setTargetPoints(pathObj.targetLocations());
    setControlPoints(pathObj.controlLocations());
  }, []);

  // Push path to history
  const pushHistory = useCallback((newPath: string) => {
    if (!historyDisabledRef.current) {
      setHistory(prev => {
        const next = prev.slice(0, historyCursor + 1);
        if (next[next.length - 1] !== newPath) {
          next.push(newPath);
          setHistoryCursor(next.length - 1);
        }
        return next;
      });
      const currentViewBox = {
        x: config.viewPortX,
        y: config.viewPortY,
        width: config.viewPortWidth,
        height: config.viewPortHeight
      };
      storageService.addPath(pathName || null, newPath, layersRef.current, currentViewBox, docViewBoxRef.current);
    }
  }, [historyCursor, pathName, config.viewPortX, config.viewPortY, config.viewPortWidth, config.viewPortHeight]);

  // Synchronize active layer geometry
  const updateActiveLayerD = useCallback((newD: string) => {
    setLayers(prev => {
      const updateList = (list: Layer[]): Layer[] =>
        list.map(l => {
          if (l.id === activeLayerIdRef.current) {
            return { ...l, d: newD };
          }
          if (l.children) {
            return { ...l, children: updateList(l.children) };
          }
          return l;
        });
      return updateList(prev);
    });
  }, []);

  // Update styling for a specific layer
  const handleUpdateLayerStyle = useCallback(
    (id: string, styles: Partial<Pick<Layer, 'fill' | 'stroke' | 'strokeWidth' | 'opacity'>>) => {
      setLayers(prev => {
        const updateList = (list: Layer[]): Layer[] =>
          list.map(l => {
            if (l.id === id) {
              return { ...l, ...styles };
            }
            if (l.children) {
              return { ...l, children: updateList(l.children) };
            }
            return l;
          });
        return updateList(prev);
      });
    },
    []
  );

  // Auto-save layers and viewBox to browser storage
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!historyDisabledRef.current && layers && layers.length > 0) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        const vb = {
          x: config.viewPortX,
          y: config.viewPortY,
          width: config.viewPortWidth,
          height: config.viewPortHeight
        };
        storageService.addPath(pathName || null, rawPath, layers, vb, docViewBoxRef.current);
      }, 250);
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [layers, pathName, rawPath, config.viewPortX, config.viewPortY, config.viewPortWidth, config.viewPortHeight, docViewBox]);

  // Reload full path string
  const reloadPath = useCallback(
    (newPath: string, autozoom = false, syncLayer = true) => {
      setHoveredItem(null);
      setFocusedItem(null);
      setRawPath(newPath);
      setInvalidSyntax(false);

      if (syncLayer) {
        updateActiveLayerD(newPath);
      }

      try {
        const p = new SvgPath(newPath);
        setParsedPath(p);
        reloadPoints(p);
        pushHistory(newPath);
        if (autozoom) {
          setTimeout(() => zoomAuto(), 50);
        }
      } catch {
        setInvalidSyntax(true);
      }
    },
    [pushHistory, reloadPoints, updateActiveLayerD, zoomAuto]
  );

  // Model change callback
  const afterModelChange = useCallback(() => {
    reloadPoints(parsedPath);
    const serialized = parsedPath.asString(4, config.minifyOutput);
    setRawPath(serialized);
    updateActiveLayerD(serialized);
    pushHistory(serialized);

    if (focusedItem && parsedPath.path.indexOf(focusedItem) === -1) {
      setFocusedItem(null);
    }
  }, [parsedPath, config.minifyOutput, reloadPoints, updateActiveLayerD, pushHistory, focusedItem]);

  const handleDragging = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
    historyDisabledRef.current = dragging;
    if (!dragging) {
      setDraggedIsNew(false);
      pushHistory(rawPath);
    }
  }, [pushHistory, rawPath]);

  // Initial load auto-zoom / viewport restore
  useEffect(() => {
    const saved = storageService.getPath();
    if (saved?.viewBox && saved.viewBox.width > 0 && saved.viewBox.height > 0 && !isOldSVGEditoSession(saved)) {
      updateViewPort(saved.viewBox.x, saved.viewBox.y, saved.viewBox.width, saved.viewBox.height, true);
      reloadPath(rawPath, false);
      if (saved.docViewBox) {
        setDocViewBox(saved.docViewBox);
      }
    } else {
      updateViewPort(kDefaultViewBox.x, kDefaultViewBox.y, kDefaultViewBox.width, kDefaultViewBox.height, true);
      reloadPath(kDefaultPath, false, false);
      storageService.addPath(null, kDefaultPath, createDefaultLayers(), kDefaultViewBox, kDefaultViewBox);
      // Wait for layout to establish canvas dimensions before auto-zooming
      setTimeout(() => zoomAuto(), 100);
    }

    // Check if first time site opened, show StartupDialog
    const startupShown = localStorage.getItem(STORAGE.STARTUP_SHOWN);
    const hashPresent = window.location.hash && window.location.hash.length > 1;
    if (!startupShown && !hashPresent) {
      setIsStartupDialogOpen(true);
      localStorage.setItem(STORAGE.STARTUP_SHOWN, 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // Undo / Redo
  const canUndo = historyCursor > 0 && !isEditingImages;
  const canRedo = historyCursor < history.length - 1 && !isEditingImages;

  const undo = useCallback(() => {
    if (canUndo) {
      historyDisabledRef.current = true;
      const targetIdx = historyCursor - 1;
      setHistoryCursor(targetIdx);
      const prevPath = history[targetIdx];
      reloadPath(prevPath);
      historyDisabledRef.current = false;
    }
  }, [canUndo, historyCursor, history, reloadPath]);

  const redo = useCallback(() => {
    if (canRedo) {
      historyDisabledRef.current = true;
      const targetIdx = historyCursor + 1;
      setHistoryCursor(targetIdx);
      const nextPath = history[targetIdx];
      reloadPath(nextPath);
      historyDisabledRef.current = false;
    }
  }, [canRedo, historyCursor, history, reloadPath]);

  // Insert or convert command
  const insert = useCallback(
    (type: SvgCommandTypeAny, after: SvgItem | null, convert: boolean) => {
      if (convert && after) {
        const newType = after.relative ? (type.toLowerCase() as SvgCommandTypeAny) : type;
        const converted = parsedPath.changeType(after, newType);
        setFocusedItem(converted);
        afterModelChange();
      } else {
        setDraggedIsNew(true);
        const pts = targetPoints;
        let point1: Point;
        let newItem: SvgItem | null = null;

        if (after) {
          point1 = after.targetLocation();
        } else if (pts.length === 0) {
          newItem = SvgItem.Make(['M', '0', '0']);
          parsedPath.insert(newItem);
          point1 = new Point(0, 0);
        } else {
          point1 = pts[pts.length - 1];
        }

        if (type.toLowerCase() !== 'm' || !newItem) {
          const relative = type.toLowerCase() === type;
          const X = (relative ? 0 : point1.x).toString();
          const Y = (relative ? 0 : point1.y).toString();

          switch (type.toLowerCase()) {
            case 'm':
            case 'l':
            case 't':
              newItem = SvgItem.Make([type, X, Y]);
              break;
            case 'h':
              newItem = SvgItem.Make([type, X]);
              break;
            case 'v':
              newItem = SvgItem.Make([type, Y]);
              break;
            case 's':
            case 'q':
              newItem = SvgItem.Make([type, X, Y, X, Y]);
              break;
            case 'c':
              newItem = SvgItem.Make([type, X, Y, X, Y, X, Y]);
              break;
            case 'a':
              newItem = SvgItem.Make([type, '1', '1', '0', '0', '0', X, Y]);
              break;
            case 'z':
              newItem = SvgItem.Make([type]);
              break;
          }

          if (newItem) {
            parsedPath.insert(newItem, after ?? undefined);
          }
        }

        historyDisabledRef.current = true;
        afterModelChange();
        historyDisabledRef.current = false;

        if (newItem) {
          setFocusedItem(newItem);
          setDraggedPoint(newItem.targetLocation());
        }
      }
    },
    [afterModelChange, parsedPath, targetPoints]
  );

  // Command permission checks
  const canDelete = useCallback(
    (item: SvgItem): boolean => {
      return parsedPath.path.indexOf(item) > 0;
    },
    [parsedPath]
  );

  const canInsertAfter = useCallback(
    (item: SvgItem | null, type: SvgCommandType): boolean => {
      let previousType: SvgCommandType | null = null;
      if (item !== null) {
        previousType = item.getType().toUpperCase() as SvgCommandType;
      } else if (parsedPath.path.length > 0) {
        previousType = parsedPath.path[parsedPath.path.length - 1].getType().toUpperCase() as SvgCommandType;
      }
      if (!previousType) {
        return type !== 'Z';
      }
      if (previousType === 'M') {
        return type !== 'M' && type !== 'Z' && type !== 'T' && type !== 'S';
      }
      if (previousType === 'Z') {
        return type !== 'Z' && type !== 'T' && type !== 'S';
      }
      if (previousType === 'C' || previousType === 'S') {
        return type !== 'T';
      }
      if (previousType === 'Q' || previousType === 'T') {
        return type !== 'S';
      }
      return type !== 'T' && type !== 'S';
    },
    [parsedPath]
  );

  const canConvert = useCallback(
    (item: SvgItem, to: SvgCommandType): boolean => {
      const idx = parsedPath.path.indexOf(item);
      if (idx <= 0) return false;
      return canInsertAfter(parsedPath.path[idx - 1], to);
    },
    [canInsertAfter, parsedPath]
  );

  const canUseAsOrigin = useCallback(
    (item: SvgItem): boolean => {
      return item.getType().toUpperCase() !== 'Z' && parsedPath.path.indexOf(item) > 1;
    },
    [parsedPath]
  );

  const hasSubPaths = useCallback((): boolean => {
    let moveCount = 0;
    for (const command of parsedPath.path) {
      if (command.getType(true) === 'M') {
        moveCount++;
        if (moveCount === 2) return true;
      }
    }
    return false;
  }, [parsedPath]);

  // Operations
  const handleScale = useCallback(
    (sx: number, sy: number) => {
      parsedPath.scale(1 * sx, 1 * sy);
      afterModelChange();
    },
    [afterModelChange, parsedPath]
  );

  const handleTranslate = useCallback(
    (tx: number, ty: number) => {
      parsedPath.translate(1 * tx, 1 * ty);
      afterModelChange();
    },
    [afterModelChange, parsedPath]
  );

  const handleRotate = useCallback(
    (ox: number, oy: number, angle: number) => {
      parsedPath.rotate(1 * ox, 1 * oy, 1 * angle);
      afterModelChange();
    },
    [afterModelChange, parsedPath]
  );

  const handleRound = useCallback(
    (roundDec: number) => {
      reloadPath(parsedPath.asString(roundDec, config.minifyOutput));
    },
    [config.minifyOutput, parsedPath, reloadPath]
  );

  const handleSetRelative = useCallback(
    (rel: boolean) => {
      parsedPath.setRelative(rel);
      afterModelChange();
    },
    [afterModelChange, parsedPath]
  );

  const handleReverse = useCallback(() => {
    reversePath(parsedPath);
    afterModelChange();
  }, [afterModelChange, parsedPath]);

  const handleOptimize = useCallback(() => {
    optimizePath(parsedPath, {
      removeUselessCommands: true,
      useHorizontalAndVerticalLines: true,
      useRelativeAbsolute: true,
      useReverse: true,
      useShorthands: true
    });
    handleConfigChange('minifyOutput', true);
    afterModelChange();
  }, [afterModelChange, handleConfigChange, parsedPath]);

  const handleDeleteItem = useCallback(
    (item: SvgItem) => {
      setFocusedItem(null);
      parsedPath.delete(item);
      afterModelChange();
    },
    [afterModelChange, parsedPath]
  );

  const handleUseAsOrigin = useCallback(
    (item: SvgItem, subpathOnly?: boolean) => {
      const idx = parsedPath.path.indexOf(item);
      changePathOrigin(parsedPath, idx, subpathOnly);
      afterModelChange();
      setFocusedItem(null);
    },
    [afterModelChange, parsedPath]
  );

  const handleReverseSubPath = useCallback(
    (item: SvgItem) => {
      const idx = parsedPath.path.indexOf(item);
      reversePath(parsedPath, idx);
      afterModelChange();
      setFocusedItem(null);
    },
    [afterModelChange, parsedPath]
  );

  // Layer Management Handlers
  const handleSelectLayer = useCallback(
    (id: string) => {
      const findLayer = (list: Layer[]): Layer | null => {
        for (const l of list) {
          if (l.id === id) return l;
          if (l.children) {
            const res = findLayer(l.children);
            if (res) return res;
          }
        }
        return null;
      };

      const target = findLayer(layers);
      if (target && target.type !== 'group') {
        setActiveLayerId(id);
        activeLayerIdRef.current = id;
        reloadPath(target.d || '', false, false);
        showToast(`Selected "${target.name}"`);
      }
    },
    [layers, reloadPath, showToast]
  );

  const handleToggleVisibility = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayers(prev => {
      const toggle = (list: Layer[]): Layer[] =>
        list.map(l => {
          if (l.id === id) return { ...l, visible: !l.visible };
          if (l.children) return { ...l, children: toggle(l.children) };
          return l;
        });
      return toggle(prev);
    });
  }, []);

  const handleToggleLock = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayers(prev => {
      const toggle = (list: Layer[]): Layer[] =>
        list.map(l => {
          if (l.id === id) return { ...l, locked: !l.locked };
          if (l.children) return { ...l, children: toggle(l.children) };
          return l;
        });
      return toggle(prev);
    });
  }, []);

  const handleAddLayer = useCallback(() => {
    const newId = `layer_${Date.now()}`;
    const newName = `Path ${layers.length + 1}`;
    const newPathD = 'M 20 20 L 80 20 L 50 80 Z';
    const newLayer: Layer = {
      id: newId,
      name: newName,
      type: 'path',
      d: newPathD,
      fill: 'none',
      stroke: '#ffffff',
      strokeWidth: 1,
      visible: true,
      locked: false
    };
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newId);
    activeLayerIdRef.current = newId;
    reloadPath(newPathD, false, false);
    showToast(`Added "${newName}"`);
  }, [layers.length, reloadPath, showToast]);

  const handleDeleteLayer = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setLayers(prev => {
        const remove = (list: Layer[]): Layer[] =>
          list
            .filter(l => l.id !== id)
            .map(l => (l.children ? { ...l, children: remove(l.children) } : l));
        const next = remove(prev);
        if (activeLayerIdRef.current === id) {
          if (next.length > 0) {
            const nextActive = next[0];
            setActiveLayerId(nextActive.id);
            activeLayerIdRef.current = nextActive.id;
            reloadPath(nextActive.d || '', false, false);
          } else {
            setActiveLayerId('');
            activeLayerIdRef.current = '';
            reloadPath('', false, false);
          }
        }
        return next;
      });
      showToast('Layer deleted');
    },
    [reloadPath, showToast]
  );

  const handleDuplicateLayer = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setLayers(prev => {
        const clone = (list: Layer[]): Layer[] => {
          const res: Layer[] = [];
          for (const l of list) {
            res.push(l);
            if (l.id === id) {
              const dupId = `layer_${Date.now()}`;
              const dupName = `${l.name} (copy)`;
              res.push({
                ...l,
                id: dupId,
                name: dupName,
                visible: true
              });
            } else if (l.children) {
              l.children = clone(l.children);
            }
          }
          return res;
        };
        return clone(prev);
      });
      showToast('Layer duplicated');
    },
    [showToast]
  );

  const handleMoveLayer = useCallback(
    (id: string, direction: 'up' | 'down', e: React.MouseEvent) => {
      e.stopPropagation();
      setLayers(prev => {
        const idx = prev.findIndex(l => l.id === id);
        if (idx === -1) return prev;
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= prev.length) return prev;
        const next = [...prev];
        const [moved] = next.splice(idx, 1);
        next.splice(targetIdx, 0, moved);
        return next;
      });
    },
    []
  );

  const handleRenameLayer = useCallback((id: string, newName: string) => {
    setLayers(prev => {
      const rename = (list: Layer[]): Layer[] =>
        list.map(l => {
          if (l.id === id) return { ...l, name: newName };
          if (l.children) return { ...l, children: rename(l.children) };
          return l;
        });
      return rename(prev);
    });
  }, []);

  const handleImportSvg = useCallback(
    (doc: SvgDocument) => {
      if (doc.layers.length === 0) return;

      setLayers(doc.layers);
      updateViewPort(
        doc.viewBox.x,
        doc.viewBox.y,
        doc.viewBox.width,
        doc.viewBox.height,
        true
      );

      const findFirstPath = (list: Layer[]): Layer | null => {
        for (const l of list) {
          if (l.type !== 'group' && l.d) return l;
          if (l.children) {
            const found = findFirstPath(l.children);
            if (found) return found;
          }
        }
        return list[0] || null;
      };

      const first = findFirstPath(doc.layers);
      if (first) {
        setActiveLayerId(first.id);
        activeLayerIdRef.current = first.id;
        reloadPath(first.d, false, false);
      }

      // Persist all imported layers, styles, and viewBox to browser storage
      setDocViewBox(doc.viewBox);
      storageService.addPath(
        pathName || null,
        first ? first.d : '',
        doc.layers,
        doc.viewBox,
        doc.viewBox
      );

      showToast(`Imported ${doc.layers.length} layers with styles`);
    },
    [pathName, reloadPath, showToast, updateViewPort]
  );

  // Hash check on load (#d=... or #P=...)
  useEffect(() => {
    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length <= 1) return;

    const decoded = decodeShareHash(rawHash);
    if (!decoded) return;

    const opened = storageService.getPath();
    const unsaved = opened && opened.path !== kDefaultPath && !isOldSVGEditoSession(opened);

    if (decoded.type === 'document') {
      if (unsaved) {
        setPendingShareImport(decoded);
        setIsImportDialogOpen(true);
      } else {
        handleImportSvg({
          viewBox: decoded.viewBox,
          layers: decoded.layers
        });
        if (decoded.activeLayerId) {
          setActiveLayerId(decoded.activeLayerId);
        }
        if (decoded.name) {
          setPathName(decoded.name);
        }
        window.location.hash = '';
      }
    } else {
      // Path payload or legacy path
      const targetPath = decoded.path;
      try {
        new SvgPath(targetPath);
        if (targetPath !== opened?.path) {
          if (unsaved) {
            setImportUrlPath(targetPath);
            setPendingShareImport(decoded);
            setIsImportDialogOpen(true);
          } else {
            reloadPath(targetPath, true);
            if ('name' in decoded && decoded.name) {
              setPathName(decoded.name);
            }
            window.location.hash = '';
          }
        }
      } catch {
        // invalid path
      }
    }
  }, [handleImportSvg, reloadPath]);

  // Drag-and-drop .svg file onto window
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.name.endsWith('.svg') || file.type === 'image/svg+xml')) {
        const reader = new FileReader();
        reader.onload = ev => {
          const text = ev.target?.result as string;
          if (text) {
            const doc = parseSvg(text);
            if (doc.layers.length > 0) {
              handleImportSvg(doc);
            }
          }
        };
        reader.readAsText(file);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleImportSvg]);

  // Global keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = e.target instanceof Element ? e.target.tagName : null;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (e.shiftKey && mod && e.key.toLowerCase() === KEYBOARD.KEYS.UNDO) {
        redo();
        e.preventDefault();
      } else if (mod && e.key.toLowerCase() === KEYBOARD.KEYS.UNDO) {
        undo();
        e.preventDefault();
      } else if (!mod && KEYBOARD.PATTERNS.SVG_COMMAND.test(e.key)) {
        const isLower = e.key === e.key.toLowerCase();
        const key = e.key.toUpperCase() as SvgCommandType;
        if (isLower) {
          const lastItem = parsedPath.path.length ? parsedPath.path[parsedPath.path.length - 1] : null;
          const prevItem = focusedItem || lastItem;
          if (canInsertAfter(prevItem, key)) {
            insert(key, prevItem, false);
            e.preventDefault();
          }
        } else if (!isLower && focusedItem && canConvert(focusedItem, key)) {
          insert(key, focusedItem, true);
          e.preventDefault();
        }
      } else if (!mod && e.key === KEYBOARD.KEYS.ESCAPE) {
        if (isDragging) {
          reloadPath(history[historyCursor]);
        } else {
          setFocusedItem(null);
          setFocusedImage(null);
          setDraggedPoint(null);
        }
        e.preventDefault();
      } else if (!mod && (e.key === KEYBOARD.KEYS.DELETE || e.key === KEYBOARD.KEYS.BACKSPACE)) {
        if (focusedItem && canDelete(focusedItem)) {
          handleDeleteItem(focusedItem);
          e.preventDefault();
        }
        if (focusedImage) {
          setImages(prev => prev.filter(im => im !== focusedImage));
          setFocusedImage(null);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    canConvert,
    canDelete,
    canInsertAfter,
    focusedImage,
    focusedItem,
    handleDeleteItem,
    history,
    historyCursor,
    insert,
    isDragging,
    parsedPath,
    redo,
    reloadPath,
    undo
  ]);

  // Context menu menu items
  const buildInsertMenuItems = (
    afterItem: SvgItem | null,
    convert: boolean
  ): MenuItem[] => {
    const commands: { type: SvgCommandType; label: string }[] = [
      { type: 'M', label: 'Move to' },
      { type: 'L', label: 'Line to' },
      { type: 'V', label: 'Vertical Line to' },
      { type: 'H', label: 'Horizontal Line to' },
      { type: 'C', label: 'Curve to' },
      { type: 'S', label: 'Shorthand Curve to' },
      { type: 'Q', label: 'Quadratic Bezier Curve to' },
      { type: 'T', label: 'Shorthand Quadratic Bezier Curve to' },
      { type: 'A', label: 'Elliptical Arc' },
      { type: 'Z', label: 'Close Path' }
    ];

    return commands.map(cmd => ({
      icon: (
        <strong
          style={{
            display: 'inline-block',
            width: 14,
            fontWeight: 700,
            fontSize: 12,
            color: '#4ec9b0',
            fontFamily: 'monospace',
            textAlign: 'center'
          }}
        >
          {cmd.type}
        </strong>
      ),
      label: cmd.label,
      disabled: convert ? (afterItem ? !canConvert(afterItem, cmd.type) : true) : !canInsertAfter(afterItem, cmd.type),
      onClick: () => insert(cmd.type, afterItem, convert)
    }));
  };

  const buildItemMenuItems = (item: SvgItem): MenuItem[] => {
    return [
      {
        label: 'Insert After',
        icon: <Plus size={14} />,
        submenu: buildInsertMenuItems(item, false)
      },
      {
        label: 'Convert To',
        icon: <RefreshCw size={14} />,
        submenu: buildInsertMenuItems(item, true)
      },
      {
        label: item.relative ? 'Set Absolute' : 'Set Relative',
        icon: <RefreshCw size={14} />,
        onClick: () => {
          item.setRelative(!item.relative);
          afterModelChange();
        }
      },
      {
        label: 'Start Path From Here',
        icon: <ArrowUpToLine size={14} />,
        disabled: !canUseAsOrigin(item),
        onClick: () => handleUseAsOrigin(item, false)
      },
      {
        label: 'Start Subpath From Here',
        icon: <ArrowUpToLine size={14} />,
        disabled: !canUseAsOrigin(item) || !hasSubPaths(),
        onClick: () => handleUseAsOrigin(item, true)
      },
      {
        label: 'Reverse Subpath',
        icon: <ArrowUpDown size={14} />,
        disabled: !hasSubPaths(),
        onClick: () => handleReverseSubPath(item)
      },
      {
        label: 'Delete',
        disabled: !canDelete(item),
        icon: <Trash2 size={14} />,
        onClick: () => handleDeleteItem(item)
      }
    ];
  };

  // Floating Context Button Position on Canvas
  const floatingBtnPosition = React.useMemo(() => {
    if (!focusedItem || !strokeWidth) return null;
    const target = focusedItem.targetLocation();
    const left = 8 + (target.x - config.viewPortX) / strokeWidth;
    const top = 8 + (target.y - config.viewPortY) / strokeWidth;
    return { left, top };
  }, [focusedItem, config.viewPortX, config.viewPortY, strokeWidth]);

  return (
    <div className="app-container">
      <Toast message={toastMessage} />

      {/* Left Sidebar Panel */}
      <div className={`left-column-wrapper ${!isLeftPanelOpened ? 'closed' : ''}`}>
        {isLeftPanelOpened && (
          <Sidebar
            rawPath={rawPath}
            onRawPathChange={p => reloadPath(p, p.length > 0)}
            invalidSyntax={invalidSyntax}
            parsedPath={parsedPath}
            config={config}
            onConfigChange={handleConfigChange}
            onUpdateViewPort={updateViewPort}
            focusedItem={focusedItem}
            onFocusItem={it => {
              setFocusedItem(it);
              if (it) {
                const idx = parsedPath.path.indexOf(it);
                document.getElementById(`svg_command_row_${idx}`)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest'
                });
              }
            }}
            hoveredItem={hoveredItem}
            onHoverItem={setHoveredItem}
            onAfterModelChange={afterModelChange}
            onScale={handleScale}
            onTranslate={handleTranslate}
            onRotate={handleRotate}
            onRound={handleRound}
            onSetRelative={handleSetRelative}
            onReverse={handleReverse}
            onOptimize={handleOptimize}
            onOpenDialog={() => setIsOpenDialogOpen(true)}
            onSaveDialog={() => setIsSaveDialogOpen(true)}
            onClearPath={() => reloadPath('', false)}
            onOpenInsertMenu={(after, pos, convert = false) => {
              setInsertMenu({ isOpen: true, position: pos, afterItem: after, convert });
            }}
            onOpenItemMenu={(it, pos) => {
              setItemMenu({ isOpen: true, position: pos, item: it });
            }}
            setHistoryDisabled={dis => {
              historyDisabledRef.current = dis;
            }}
            onOpenAbout={() => setIsAboutDialogOpen(true)}
          />
        )}

        {/* Panel collapse button */}
        <button
          className={`left-column-toggle ${isLeftPanelOpened ? 'close-btn' : 'open-btn'}`}
          title={isLeftPanelOpened ? 'Collapse sidebar' : 'Open sidebar'}
          onClick={() => setIsLeftPanelOpened(prev => !prev)}
        >
          {isLeftPanelOpened ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Main Canvas Workspace */}
      <div className="drawings-area">
        {/* Floating Start Screen / Template Button on Top Left */}
        <div className="scene-top-left-actions">
          <button
            className="scene-top-left-btn"
            title="Open Quick Start & Templates (<StartupDialog>)"
            onClick={() => setIsStartupDialogOpen(true)}
          >
            <Sparkles size={16} />
            <span className="btn-text">Start</span>
          </button>
        </div>
        {/* Floating Context Button on Selected Node */}
        {floatingBtnPosition && !config.preview && !isEditingImages && (
          <button
            className="mini-fab accent"
            style={{
              position: 'absolute',
              left: floatingBtnPosition.left,
              top: floatingBtnPosition.top,
              width: 28,
              height: 28,
              zIndex: 10
            }}
            title="Command options"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              setItemMenu({
                isOpen: true,
                position: { x: rect.right + 4, y: rect.top },
                item: focusedItem
              });
            }}
          >
            <MoreVertical size={16} />
          </button>
        )}

        {/* Floating Context Button on Selected Image */}
        {focusedImage && !config.preview && !isDragging && (
          <button
            className="mini-fab accent"
            style={{
              position: 'absolute',
              left: 8 + (Math.max(focusedImage.x1, focusedImage.x2) - config.viewPortX) / strokeWidth,
              top: 8 + (Math.max(focusedImage.y1, focusedImage.y2) - config.viewPortY) / strokeWidth,
              width: 28,
              height: 28,
              zIndex: 10
            }}
            title="Image options"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              setImageMenu({
                isOpen: true,
                position: { x: rect.right + 4, y: rect.top },
                image: focusedImage
              });
            }}
          >
            <MoreVertical size={16} />
          </button>
        )}

        {/* Top Right Scene Action Bar */}
        <div className="scene-top-actions">
          <button
            className="mini-fab primary"
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            onClick={undo}
          >
            <Undo2 size={16} />
          </button>
          <button
            className="mini-fab primary"
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            onClick={redo}
          >
            <Redo2 size={16} />
          </button>

          <div className="toolbar-divider" />

          {/* Reference Image Upload & Management */}
          {isEditingImages && (
            <button
              className="mini-fab primary"
              title="Add Reference Image"
              onClick={() => setIsUploadImageDialogOpen(true)}
            >
              <Plus size={16} />
            </button>
          )}

          <button
            className={`mini-fab ${isEditingImages ? 'accent' : 'primary'}`}
            title={isEditingImages ? 'Exit Image Mode' : 'Manage Reference Images'}
            onClick={() => {
              const next = !isEditingImages;
              setIsEditingImages(next);
              setFocusedImage(null);
              setFocusedItem(null);
              if (next && images.length === 0) {
                setIsUploadImageDialogOpen(true);
              }
            }}
          >
            <ImageIcon size={16} />
          </button>

          <button
            className="mini-fab primary"
            title="Export as SVG"
            onClick={() => setIsExportDialogOpen(true)}
          >
            <Download size={16} />
          </button>

          <button
            className="mini-fab primary"
            title="Share path link"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 size={16} />
          </button>

          <div className="toolbar-divider" />

          <button
            className={`mini-fab ${config.renderColors ? 'accent' : 'primary'}`}
            title={config.renderColors ? 'Showing SVG colors (Click for wireframe)' : 'Wireframe mode (Click to show SVG colors)'}
            onClick={() => handleConfigChange('renderColors', !config.renderColors)}
          >
            <Palette size={16} />
          </button>

          <button
            className={`mini-fab ${isRightPanelOpened ? 'accent' : 'primary'}`}
            title={isRightPanelOpened ? 'Hide Layers Panel' : 'Show Layers Panel'}
            onClick={handleToggleRightPanel}
          >
            <LayersIcon size={16} />
          </button>
        </div>

        {/* Bottom Right Zoom & View Controls */}
        <div className="scene-bottom-actions">
          <button
            className={`mini-fab ${config.snapToGrid ? 'accent' : 'primary'}`}
            title="Snap to Grid"
            onClick={() => handleConfigChange('snapToGrid', !config.snapToGrid)}
          >
            <Grid size={18} />
          </button>
          <button
            className="mini-fab primary"
            title="Zoom In"
            onClick={() => {
              handleConfigChange('viewPortLocked', false);
              canvasRef.current?.zoomViewPort(9 / 10);
            }}
          >
            <ZoomIn size={18} />
          </button>
          <button
            className="mini-fab primary"
            title="Zoom to Fit"
            onClick={() => {
              handleConfigChange('viewPortLocked', false);
              zoomAuto();
            }}
          >
            <Maximize2 size={18} />
          </button>
          <button
            className="mini-fab primary"
            title="Zoom Out"
            onClick={() => {
              handleConfigChange('viewPortLocked', false);
              canvasRef.current?.zoomViewPort(10 / 9);
            }}
          >
            <ZoomOut size={18} />
          </button>
        </div>

        {/* Floating coordinates indicator */}
        {cursorPosition ? (
          <label className="cursor-position">
            {cursorPosition.x.toFixed(cursorPosition.decimals)}, {cursorPosition.y.toFixed(cursorPosition.decimals)}
          </label>
        ) : hoverPosition && !isEditingImages ? (
          <label className="hover-position">
            {hoverPosition.x.toFixed(3)}, {hoverPosition.y.toFixed(3)}
          </label>
        ) : null}

        {/* SVG Canvas Component */}
        <Canvas
          ref={canvasRef}
          parsedPath={parsedPath}
          targetPoints={targetPoints}
          controlPoints={controlPoints}
          draggedPoint={draggedPoint}
          onDraggedPointChange={setDraggedPoint}
          focusedItem={focusedItem}
          onFocusedItemChange={it => {
            setFocusedItem(it);
            if (it) {
              const idx = parsedPath.path.indexOf(it);
              document.getElementById(`svg_command_row_${idx}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
              });
            }
          }}
          hoveredItem={hoveredItem}
          onHoveredItemChange={setHoveredItem}
          wasCanvasDragged={wasCanvasDragged}
          onWasCanvasDraggedChange={setWasCanvasDragged}
          draggedIsNew={draggedIsNew}
          decimals={decimals}
          viewPortX={config.viewPortX}
          viewPortY={config.viewPortY}
          viewPortWidth={config.viewPortWidth}
          viewPortHeight={config.viewPortHeight}
          strokeWidth={strokeWidth}
          preview={config.preview}
          filled={config.filled}
          renderColors={config.renderColors}
          showTicks={config.showTicks}
          images={images}
          editImages={isEditingImages}
          focusedImage={focusedImage}
          onFocusedImageChange={setFocusedImage}
          onAfterModelChange={afterModelChange}
          onDragging={handleDragging}
          onViewPort={vp => updateViewPort(vp.x, vp.y, vp.w, vp.h, vp.force)}
          onHoverPosition={setHoverPosition}
          onCursorPosition={setCursorPosition}
          layers={layers}
          activeLayerId={activeLayerId}
          onSelectLayer={handleSelectLayer}
          onCanvasWidthChange={handleCanvasWidthChange}
          onCanvasHeightChange={handleCanvasHeightChange}
        />
      </div>

      {/* Right Sidebar Layers Panel */}
      <LayersSidebar
        layers={layers}
        activeLayerId={activeLayerId}
        onSelectLayer={handleSelectLayer}
        onToggleVisibility={handleToggleVisibility}
        onToggleLock={handleToggleLock}
        onAddLayer={handleAddLayer}
        onDeleteLayer={handleDeleteLayer}
        onDuplicateLayer={handleDuplicateLayer}
        onMoveLayer={handleMoveLayer}
        onRenameLayer={handleRenameLayer}
        onImportSvgClick={() => setIsImportSvgDialogOpen(true)}
        renderColors={config.renderColors}
        onToggleRenderColors={() => handleConfigChange('renderColors', !config.renderColors)}
        onUpdateLayerStyle={handleUpdateLayerStyle}
        isOpened={isRightPanelOpened}
        onToggleOpen={handleToggleRightPanel}
      />

      {/* Context Menus */}
      <ContextMenu
        isOpen={insertMenu.isOpen}
        onClose={() => setInsertMenu(prev => ({ ...prev, isOpen: false }))}
        position={insertMenu.position}
        items={buildInsertMenuItems(insertMenu.afterItem, insertMenu.convert)}
      />

      {itemMenu.item && (
        <ContextMenu
          isOpen={itemMenu.isOpen}
          onClose={() => setItemMenu(prev => ({ ...prev, isOpen: false }))}
          position={itemMenu.position}
          items={buildItemMenuItems(itemMenu.item)}
        />
      )}

      {imageMenu.image && (
        <ContextMenu
          isOpen={imageMenu.isOpen}
          onClose={() => setImageMenu(prev => ({ ...prev, isOpen: false }))}
          position={imageMenu.position}
        >
          <div style={{ padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>
              Opacity: {imageMenu.image.opacity.toFixed(2)}
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={imageMenu.image.opacity}
              onChange={e => {
                const val = parseFloat(e.target.value);
                if (imageMenu.image) {
                  imageMenu.image.opacity = val;
                  setImages([...images]);
                }
              }}
              style={{ width: '100%', accentColor: '#007acc' }}
            />
          </div>
          <button
            onClick={() => {
              if (imageMenu.image) {
                imageMenu.image.preserveAspectRatio = !imageMenu.image.preserveAspectRatio;
                setImages([...images]);
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: 12,
              textAlign: 'left'
            }}
          >
            Toggle Preserve Aspect Ratio
          </button>
          <button
            onClick={() => {
              if (imageMenu.image) {
                setImages(prev => prev.filter(im => im !== imageMenu.image));
                setFocusedImage(null);
                setImageMenu(prev => ({ ...prev, isOpen: false }));
              }
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'none',
              border: 'none',
              color: '#ff5555',
              cursor: 'pointer',
              fontSize: 12,
              textAlign: 'left'
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </ContextMenu>
      )}

      {/* Modals */}
      <OpenDialog
        isOpen={isOpenDialogOpen}
        onClose={() => setIsOpenDialogOpen(false)}
        storageService={storageService}
        onSelectPath={(name, path, savedLayers, savedViewBox, savedDocViewBox) => {
          setPathName(name);
          if (savedLayers && savedLayers.length > 0) {
            setLayers(savedLayers);
            const first = savedLayers.find(l => l.type !== 'group' && l.d) || savedLayers[0];
            if (first) {
              setActiveLayerId(first.id);
              activeLayerIdRef.current = first.id;
            }
          }
          if (savedDocViewBox) {
            setDocViewBox(savedDocViewBox);
          } else if (savedViewBox) {
            setDocViewBox(savedViewBox);
          }
          if (savedViewBox) {
            updateViewPort(savedViewBox.x, savedViewBox.y, savedViewBox.width, savedViewBox.height, true);
            reloadPath(path, false);
          } else {
            reloadPath(path, true);
          }
          showToast(`Opened "${name}"`);
        }}
      />

      <SaveDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        storageService={storageService}
        currentName={pathName}
        path={rawPath}
        layers={layers}
        viewBox={{
          x: config.viewPortX,
          y: config.viewPortY,
          width: config.viewPortWidth,
          height: config.viewPortHeight
        }}
        docViewBox={docViewBox}
        onSaveSuccess={savedName => {
          setPathName(savedName);
          showToast('Project saved successfully');
        }}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        path={rawPath}
        name={pathName}
        layers={layers}
        activeLayerId={activeLayerId}
        documentViewBox={docViewBox}
        onShowToast={showToast}
      />

      <ImportSvgDialog
        isOpen={isImportSvgDialogOpen}
        onClose={() => setIsImportSvgDialogOpen(false)}
        onImport={handleImportSvg}
      />

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        path={rawPath}
        name={pathName}
        layers={layers}
        activeLayerId={activeLayerId}
        documentViewBox={docViewBox}
        onShowToast={showToast}
      />

      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => {
          setIsImportDialogOpen(false);
          setPendingShareImport(null);
          window.location.hash = '';
        }}
        path={importUrlPath}
        layers={pendingShareImport?.type === 'document' ? pendingShareImport.layers : undefined}
        mode={pendingShareImport?.type === 'document' ? 'document' : 'path'}
        name={pendingShareImport && 'name' in pendingShareImport ? pendingShareImport.name : undefined}
        onConfirm={() => {
          if (pendingShareImport?.type === 'document') {
            handleImportSvg({
              viewBox: pendingShareImport.viewBox,
              layers: pendingShareImport.layers
            });
            if (pendingShareImport.activeLayerId) {
              setActiveLayerId(pendingShareImport.activeLayerId);
            }
            if (pendingShareImport.name) {
              setPathName(pendingShareImport.name);
            }
          } else {
            reloadPath(importUrlPath, true);
            if (pendingShareImport && 'name' in pendingShareImport && pendingShareImport.name) {
              setPathName(pendingShareImport.name);
            }
          }
          setPendingShareImport(null);
          setIsImportDialogOpen(false);
          window.location.hash = '';
        }}
      />

      <UploadImageDialog
        isOpen={isUploadImageDialogOpen}
        onClose={() => {
          setIsUploadImageDialogOpen(false);
          if (images.length === 0) {
            setIsEditingImages(false);
          }
        }}
        onAddImage={newImg => {
          setImages(prev => [...prev, newImg]);
          setFocusedImage(newImg);
          setIsEditingImages(true);
        }}
      />

      <AboutDialog
        isOpen={isAboutDialogOpen}
        onClose={() => setIsAboutDialogOpen(false)}
      />

      <StartupDialog
        isOpen={isStartupDialogOpen}
        onClose={() => setIsStartupDialogOpen(false)}
        savedPathsCount={storageService.storedPaths.filter(it => Boolean(it.name)).length}
        onSelectSample={sample => {
          setPathName(sample.title);
          const loadedLayers: Layer[] =
            sample.layers && sample.layers.length > 0
              ? JSON.parse(JSON.stringify(sample.layers))
              : [
                {
                  id: `layer_${Date.now()}`,
                  name: sample.title,
                  type: 'path',
                  d: sample.d,
                  fill: sample.fill || 'none',
                  stroke: sample.stroke || (sample.fill ? 'none' : '#ffffff'),
                  strokeWidth: sample.strokeWidth || 1,
                  visible: true,
                  locked: false
                }
              ];

          setLayers(loadedLayers);
          const firstPathLayer = loadedLayers.find(l => l.type !== 'group' && l.d) || loadedLayers[0];
          if (firstPathLayer) {
            setActiveLayerId(firstPathLayer.id);
            activeLayerIdRef.current = firstPathLayer.id;
          }
          setDocViewBox(sample.viewBox);
          updateViewPort(sample.viewBox.x, sample.viewBox.y, sample.viewBox.width, sample.viewBox.height, true);
          reloadPath(firstPathLayer ? firstPathLayer.d || '' : sample.d, true, false);
          storageService.addPath(null, firstPathLayer ? firstPathLayer.d || '' : sample.d, loadedLayers, sample.viewBox, sample.viewBox);
          showToast(`Loaded sample "${sample.title}" (${loadedLayers.length} path${loadedLayers.length > 1 ? 's' : ''})`);
        }}
        onOpenSaved={() => {
          setIsOpenDialogOpen(true);
        }}
        onImportSvgFile={doc => {
          handleImportSvg(doc);
        }}
        onNewBlank={() => {
          setPathName('');
          const blankLayer: Layer = {
            id: `layer_${Date.now()}`,
            name: 'Path 1',
            type: 'path',
            d: '',
            fill: 'none',
            stroke: '#ffffff',
            strokeWidth: 1,
            visible: true,
            locked: false
          };
          setLayers([blankLayer]);
          setActiveLayerId(blankLayer.id);
          activeLayerIdRef.current = blankLayer.id;
          const defaultVb = { x: 0, y: 0, width: 100, height: 100 };
          setDocViewBox(defaultVb);
          updateViewPort(0, 0, 100, 100, true);
          reloadPath('', false, false);
          storageService.addPath(null, '', [blankLayer], defaultVb, defaultVb);
          showToast('Started with new blank canvas');
        }}
      />
    </div>
  );
};
