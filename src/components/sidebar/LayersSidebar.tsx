import React, { useState } from 'react';
import { Layer } from '../../types/layer';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers as LayersIcon,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Folder,
  FolderOpen,
  Square,
  Circle,
  Spline,
  Minus,
  Pentagon,
  Upload,
  Palette
} from 'lucide-react';

interface LayersSidebarProps {
  layers: Layer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string, e: React.MouseEvent) => void;
  onToggleLock: (id: string, e: React.MouseEvent) => void;
  onAddLayer: () => void;
  onDeleteLayer: (id: string, e: React.MouseEvent) => void;
  onDuplicateLayer: (id: string, e: React.MouseEvent) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down', e: React.MouseEvent) => void;
  onRenameLayer: (id: string, newName: string) => void;
  onImportSvgClick: () => void;
  renderColors?: boolean;
  onToggleRenderColors?: () => void;
  onUpdateLayerStyle?: (
    id: string,
    styles: Partial<Pick<Layer, 'fill' | 'stroke' | 'strokeWidth' | 'opacity'>>
  ) => void;
  isOpened: boolean;
  onToggleOpen: () => void;
}

export const LayersSidebar: React.FC<LayersSidebarProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onAddLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onMoveLayer,
  onRenameLayer,
  onImportSvgClick,
  renderColors = true,
  onToggleRenderColors,
  onUpdateLayerStyle,
  isOpened,
  onToggleOpen
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  const startRename = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(layer.id);
    setEditName(layer.name);
  };

  const commitRename = (id: string) => {
    if (editName.trim()) {
      onRenameLayer(id, editName.trim());
    }
    setEditingId(null);
  };

  const getLayerIcon = (layer: Layer) => {
    switch (layer.type) {
      case 'group':
        return layer.expanded ? <FolderOpen size={14} color="#f6c177" /> : <Folder size={14} color="#f6c177" />;
      case 'rect':
        return <Square size={14} color="#9ccfd8" />;
      case 'circle':
      case 'ellipse':
        return <Circle size={14} color="#ebbcba" />;
      case 'line':
        return <Minus size={14} color="#c4a7e7" />;
      case 'polygon':
      case 'polyline':
        return <Pentagon size={14} color="#ea9a97" />;
      case 'path':
      default:
        return <Spline size={14} color="#4ec9b0" />;
    }
  };

  const renderLayerItem = (layer: Layer, depth = 0, index = 0, total = layers.length) => {
    const isActive = layer.id === activeLayerId;
    const isEditing = editingId === layer.id;

    return (
      <React.Fragment key={layer.id}>
        <div
          className={`layer-item-row ${isActive ? 'active' : ''} ${!layer.visible ? 'hidden-layer' : ''}`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (!layer.locked) {
              onSelectLayer(layer.id);
            }
          }}
          title={layer.locked ? `${layer.name} (Locked)` : layer.name}
        >
          {/* Visibility toggle button */}
          <button
            className="layer-action-btn"
            title={layer.visible ? 'Hide layer' : 'Show layer'}
            onClick={e => onToggleVisibility(layer.id, e)}
          >
            {layer.visible ? <Eye size={13} /> : <EyeOff size={13} color="#888888" />}
          </button>

          {/* Lock toggle button */}
          <button
            className="layer-action-btn"
            title={layer.locked ? 'Unlock layer' : 'Lock layer'}
            onClick={e => onToggleLock(layer.id, e)}
          >
            {layer.locked ? <Lock size={13} color="#f44336" /> : <Unlock size={13} color="#777777" />}
          </button>

          {/* Layer type icon */}
          <span className="layer-type-icon">{getLayerIcon(layer)}</span>

          {/* Color swatch badge */}
          {layer.fill && layer.fill.toLowerCase() !== 'none' ? (
            <span
              className="layer-color-badge"
              style={{ backgroundColor: layer.fill }}
              title={`Fill: ${layer.fill}`}
            />
          ) : layer.stroke && layer.stroke.toLowerCase() !== 'none' ? (
            <span
              className="layer-color-badge stroke-only"
              style={{ borderColor: layer.stroke }}
              title={`Stroke: ${layer.stroke}`}
            />
          ) : null}

          {/* Layer Name / Inline editor */}
          {isEditing ? (
            <input
              type="text"
              className="layer-name-input"
              value={editName}
              autoFocus
              onChange={e => setEditName(e.target.value)}
              onBlur={() => commitRename(layer.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename(layer.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span
              className="layer-name"
              onDoubleClick={e => startRename(layer, e)}
              title="Double click to rename"
            >
              {layer.name}
            </span>
          )}

          <div style={{ flex: 1 }} />

          {/* Layer Action Icons (appear or hover) */}
          <div className="layer-quick-actions" onClick={e => e.stopPropagation()}>
            {/* Move Up */}
            <button
              className="layer-action-btn"
              disabled={index === 0}
              title="Move Up"
              onClick={e => onMoveLayer(layer.id, 'up', e)}
            >
              <ChevronUp size={12} />
            </button>
            {/* Move Down */}
            <button
              className="layer-action-btn"
              disabled={index === total - 1}
              title="Move Down"
              onClick={e => onMoveLayer(layer.id, 'down', e)}
            >
              <ChevronDown size={12} />
            </button>
            {/* Duplicate */}
            <button
              className="layer-action-btn"
              title="Duplicate"
              onClick={e => onDuplicateLayer(layer.id, e)}
            >
              <Copy size={12} />
            </button>
            {/* Delete */}
            <button
              className="layer-action-btn delete-btn"
              title="Delete Layer"
              onClick={e => onDeleteLayer(layer.id, e)}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Render child layers if group is expanded */}
        {layer.children && layer.expanded && (
          <div className="layer-group-children">
            {layer.children.map((child, cIdx) =>
              renderLayerItem(child, depth + 1, cIdx, layer.children!.length)
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className={`right-column-wrapper ${!isOpened ? 'closed' : ''}`}>
      {/* Floating vertical tab when closed - positioned cleanly below top actions bar */}
      {!isOpened && (
        <button
          className="right-column-toggle open-btn"
          title="Open layers panel"
          onClick={onToggleOpen}
        >
          <ChevronLeft size={14} />
          <span className="right-toggle-label">LAYERS</span>
        </button>
      )}

      {isOpened && (
        <div className="right-column">
          {/* Layers Header */}
          <div className="layers-header">
            <div className="layers-title-row">
              <div className="layers-title">
                <LayersIcon size={16} />
                <span>Layers</span>
                <span className="layers-badge">{layers.length}</span>
              </div>
              <div className="layers-header-actions">
                {onToggleRenderColors && (
                  <button
                    className={`mini-fab ${renderColors ? 'accent' : 'primary'}`}
                    style={{ width: 28, height: 28 }}
                    title={renderColors ? 'Showing SVG colors (Click for wireframe)' : 'Wireframe mode (Click to show SVG colors)'}
                    onClick={onToggleRenderColors}
                  >
                    <Palette size={14} />
                  </button>
                )}
                <button
                  className="mini-fab primary"
                  style={{ width: 28, height: 28 }}
                  title="Import full SVG file"
                  onClick={onImportSvgClick}
                >
                  <Upload size={14} />
                </button>
                <button
                  className="mini-fab accent"
                  style={{ width: 28, height: 28 }}
                  title="Add new path layer"
                  onClick={onAddLayer}
                >
                  <Plus size={16} />
                </button>
                <button
                  className="mini-fab primary"
                  style={{ width: 28, height: 28 }}
                  title="Collapse layers panel"
                  onClick={onToggleOpen}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="layers-subtitle">
              Select a layer to edit its path geometry
            </div>
          </div>

          {/* Layers List */}
          <div className="layers-list">
            {layers.length === 0 ? (
              <div className="layers-empty">
                <p>No layers in document.</p>
                <button className="mat-flat-button" onClick={onAddLayer}>
                  <Plus size={14} /> Add Layer
                </button>
              </div>
            ) : (
              layers.map((layer, idx) => renderLayerItem(layer, 0, idx, layers.length))
            )}
          </div>

          {/* Active Layer Properties / Styling Inspector */}
          {(() => {
            const findActiveLayer = (list: Layer[]): Layer | null => {
              for (const l of list) {
                if (l.id === activeLayerId) return l;
                if (l.children) {
                  const found = findActiveLayer(l.children);
                  if (found) return found;
                }
              }
              return null;
            };
            const activeLayer = findActiveLayer(layers);
            if (!activeLayer || !onUpdateLayerStyle) return null;

            const isNoneFill = !activeLayer.fill || activeLayer.fill.toLowerCase() === 'none';
            const isNoneStroke = !activeLayer.stroke || activeLayer.stroke.toLowerCase() === 'none';

            return (
              <div className="layer-properties-panel">
                <div className="layer-properties-header">
                  <span>STYLE ({activeLayer.name})</span>
                </div>
                {/* Fill control */}
                <div className="layer-prop-row">
                  <label>Fill</label>
                  <div className="layer-prop-controls">
                    <input
                      type="color"
                      className="layer-color-picker"
                      value={
                        !isNoneFill && activeLayer.fill && activeLayer.fill.startsWith('#') && activeLayer.fill.length === 7
                          ? activeLayer.fill
                          : '#448cef'
                      }
                      disabled={isNoneFill}
                      onChange={e => onUpdateLayerStyle(activeLayer.id, { fill: e.target.value })}
                      title="Choose fill color"
                    />
                    <input
                      type="text"
                      className="app-input layer-hex-input"
                      value={activeLayer.fill || 'none'}
                      onChange={e => onUpdateLayerStyle(activeLayer.id, { fill: e.target.value })}
                    />
                    <button
                      className={`layer-toggle-btn ${isNoneFill ? 'active' : ''}`}
                      onClick={() =>
                        onUpdateLayerStyle(activeLayer.id, {
                          fill: isNoneFill ? '#448cef' : 'none'
                        })
                      }
                      title="Toggle fill none"
                    >
                      {isNoneFill ? 'none' : 'fill'}
                    </button>
                  </div>
                </div>

                {/* Stroke control */}
                <div className="layer-prop-row">
                  <label>Stroke</label>
                  <div className="layer-prop-controls">
                    <input
                      type="color"
                      className="layer-color-picker"
                      value={
                        !isNoneStroke && activeLayer.stroke && activeLayer.stroke.startsWith('#') && activeLayer.stroke.length === 7
                          ? activeLayer.stroke
                          : '#ffffff'
                      }
                      disabled={isNoneStroke}
                      onChange={e => onUpdateLayerStyle(activeLayer.id, { stroke: e.target.value })}
                      title="Choose stroke color"
                    />
                    <input
                      type="text"
                      className="app-input layer-hex-input"
                      value={activeLayer.stroke || 'none'}
                      onChange={e => onUpdateLayerStyle(activeLayer.id, { stroke: e.target.value })}
                    />
                    <input
                      type="number"
                      className="app-input layer-num-input"
                      min="0"
                      step="0.5"
                      value={activeLayer.strokeWidth ?? 1}
                      onChange={e =>
                        onUpdateLayerStyle(activeLayer.id, {
                          strokeWidth: Math.max(0, parseFloat(e.target.value) || 0)
                        })
                      }
                      title="Stroke Width"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
