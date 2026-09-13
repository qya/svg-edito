import React, { useMemo, useId } from 'react';
import { Layer } from '../../types/layer';
import { browserComputePathBoundingBox, computeDocumentBoundingBox } from '../../utils/svg-bbox';

export interface PathPreviewProps {
  mode?: 'full' | 'active';
  layers?: Layer[];
  activeLayerId?: string | null;
  path: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  size?: number;
}

export const PathPreview: React.FC<PathPreviewProps> = ({
  mode = 'active',
  layers,
  activeLayerId,
  path,
  x: propX,
  y: propY,
  width: propWidth,
  height: propHeight,
  fillColor = '#ffffff',
  strokeColor,
  strokeWidth,
  size = 300
}) => {
  const patternId = useId();
  const clipId = useId();

  const { x, y, width, height } = useMemo(() => {
    if (propX !== undefined && propY !== undefined && propWidth !== undefined && propHeight !== undefined) {
      return { x: propX, y: propY, width: propWidth, height: propHeight };
    }
    if (mode === 'full' && layers && layers.length > 0) {
      const docBox = computeDocumentBoundingBox(layers);
      return {
        x: docBox.x - 2,
        y: docBox.y - 2,
        width: Math.max(docBox.width + 4, 10),
        height: Math.max(docBox.height + 4, 10)
      };
    }
    const bbox = browserComputePathBoundingBox(path);
    return {
      x: bbox.x - 2,
      y: bbox.y - 2,
      width: Math.max(bbox.width + 4, 10),
      height: Math.max(bbox.height + 4, 10)
    };
  }, [mode, layers, path, propX, propY, propWidth, propHeight]);

  const patternScale = Math.max(width / 400, height / 400);

  const renderLayer = (layer: Layer): React.ReactNode => {
    if (!layer.visible) return null;

    if (layer.type === 'group') {
      return (
        <g
          key={`prev_g_${layer.id}`}
          id={`prev_g_${layer.id}`}
          transform={layer.transform}
          opacity={layer.opacity}
        >
          {layer.children?.map(renderLayer)}
        </g>
      );
    }

    const d = layer.id === activeLayerId && path ? path : layer.d;
    if (!d || !d.trim()) return null;

    const layerFill =
      layer.fill !== undefined
        ? layer.fill
        : layer.stroke && layer.stroke !== 'none'
        ? 'none'
        : '#ffffff';
    const layerStroke = layer.stroke ? layer.stroke : 'none';
    const layerStrokeWidth =
      layer.strokeWidth !== undefined ? layer.strokeWidth : layerStroke !== 'none' ? 1 : undefined;

    return (
      <path
        key={`prev_l_${layer.id}`}
        id={`prev_l_${layer.id}`}
        d={d}
        fill={layerFill}
        stroke={layerStroke}
        strokeWidth={layerStrokeWidth}
        opacity={layer.opacity}
        transform={layer.transform}
      />
    );
  };

  return (
    <svg
      viewBox={`${x} ${y} ${width} ${height}`}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        backgroundColor: '#1e1e1e',
        border: '1px solid #3e3e42',
        borderRadius: 4
      }}
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${x}, ${y}) scale(${patternScale})`}
        >
          <rect x="0" y="0" width="16" height="16" fill="#2a2a2a" />
          <rect x="0" y="0" width="8" height="8" fill="#383838" />
          <rect x="8" y="8" width="8" height="8" fill="#383838" />
        </pattern>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={width} height={height} fill={`url(#${patternId})`} />
      <g clipPath={`url(#${clipId})`}>
        {mode === 'full' && layers && layers.length > 0 ? (
          layers.map(renderLayer)
        ) : (
          <path
            d={path}
            fill={fillColor || 'none'}
            strokeWidth={strokeWidth}
            stroke={strokeColor || 'none'}
          />
        )}
      </g>
    </svg>
  );
};
