import React, { useState, useRef } from 'react';
import { Expandable } from '../common/Expandable';
import { NumberInput } from '../common/NumberInput';
import { SvgPath, SvgItem } from '../../lib/svg';
import type { SvgCommandTypeAny } from '../../lib/svg-command-types';
import { EditorConfig } from '../../services/config.service';
import { APP_VERSION } from '../../version';
import { Logo } from '../common/Logo';
import {
  Lock,
  Unlock,
  Plus,
  Trash2,
  FolderOpen,
  Save,
  MoreVertical
} from 'lucide-react';

const TOOLTIP_LABELS: Record<SvgCommandTypeAny, string[]> = {
  'M': ['x', 'y'],
  'm': ['dx', 'dy'],
  'L': ['x', 'y'],
  'l': ['dx', 'dy'],
  'V': ['y'],
  'v': ['dy'],
  'H': ['x'],
  'h': ['dx'],
  'C': ['x1', 'y1', 'x2', 'y2', 'x', 'y'],
  'c': ['dx1', 'dy1', 'dx2', 'dy2', 'dx', 'dy'],
  'S': ['x2', 'y2', 'x', 'y'],
  's': ['dx2', 'dy2', 'dx', 'dy'],
  'Q': ['x1', 'y1', 'x', 'y'],
  'q': ['dx1', 'dy1', 'dx', 'dy'],
  'T': ['x', 'y'],
  't': ['dx', 'dy'],
  'A': ['rx', 'ry', 'x-axis-rotation', 'large-arc-flag', 'sweep-flag', 'x', 'y'],
  'a': ['rx', 'ry', 'x-axis-rotation', 'large-arc-flag', 'sweep-flag', 'dx', 'dy'],
  'Z': [],
  'z': []
};

interface SidebarProps {
  rawPath: string;
  onRawPathChange: (val: string) => void;
  invalidSyntax: boolean;
  parsedPath: SvgPath;
  config: EditorConfig;
  onConfigChange: <K extends keyof EditorConfig>(key: K, val: EditorConfig[K]) => void;
  onUpdateViewPort: (x: number, y: number, w: number | null, h: number | null, force?: boolean) => void;
  focusedItem: SvgItem | null;
  onFocusItem: (item: SvgItem | null) => void;
  hoveredItem: SvgItem | null;
  onHoverItem: (item: SvgItem | null) => void;
  onAfterModelChange: () => void;
  onScale: (sx: number, sy: number) => void;
  onTranslate: (tx: number, ty: number) => void;
  onRotate: (ox: number, oy: number, angle: number) => void;
  onRound: (decimals: number) => void;
  onSetRelative: (rel: boolean) => void;
  onReverse: () => void;
  onOptimize: () => void;
  onOpenDialog: () => void;
  onSaveDialog: () => void;
  onClearPath: () => void;
  onOpenInsertMenu: (item: SvgItem | null, anchorPos: { x: number; y: number }, convert?: boolean) => void;
  onOpenItemMenu: (item: SvgItem, anchorPos: { x: number; y: number }) => void;
  setHistoryDisabled: (disabled: boolean) => void;
  onOpenAbout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  rawPath,
  onRawPathChange,
  invalidSyntax,
  parsedPath,
  config,
  onConfigChange,
  onUpdateViewPort,
  focusedItem,
  onFocusItem,
  hoveredItem,
  onHoverItem,
  onAfterModelChange,
  onScale,
  onTranslate,
  onRotate,
  onRound,
  onSetRelative,
  onReverse,
  onOptimize,
  onOpenDialog,
  onSaveDialog,
  onClearPath,
  onOpenInsertMenu,
  onOpenItemMenu,
  setHistoryDisabled,
  onOpenAbout
}) => {
  // Local transformation inputs
  const [scaleX, setScaleX] = useState(1);
  const [scaleY, setScaleY] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [rotateAngle, setRotateAngle] = useState(0);
  const [roundDecimals, setRoundDecimals] = useState(1);

  const addBtnRef = useRef<HTMLButtonElement>(null);

  // Command input arrow key navigation
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIdx: number,
    colIdx: number
  ) => {
    const input = e.currentTarget;
    const isAtStart = input.selectionStart === 0 && input.selectionEnd === 0;
    const isAtEnd = input.selectionStart === input.value.length && input.selectionEnd === input.value.length;

    let targetRow = rowIdx;
    let targetCol = colIdx;

    if (e.key === 'ArrowUp') {
      targetRow = rowIdx - 1;
    } else if (e.key === 'ArrowDown') {
      targetRow = rowIdx + 1;
    } else if (e.key === 'ArrowLeft' && isAtStart) {
      targetCol = colIdx - 1;
    } else if (e.key === 'ArrowRight' && isAtEnd) {
      targetCol = colIdx + 1;
    } else {
      return;
    }

    const targetEl = document.getElementById(`svg_command_${targetRow}_${targetCol}`) as HTMLInputElement;
    if (targetEl) {
      targetEl.focus();
      targetEl.select();
      e.preventDefault();
    }
  };

  const handleSetValue = (item: SvgItem, idx: number, val: number) => {
    if (!isNaN(val)) {
      item.values[idx] = val;
      parsedPath.refreshAbsolutePositions();
      onAfterModelChange();
    }
  };

  return (
    <div className="left-column">
      {/* 1. Path section */}
      <Expandable panelTitle="Path" panelInfo={rawPath.length.toString()} defaultOpened={true}>
        <div className="row" style={{ padding: '0 4px' }}>
          <div className={`input-block ${invalidSyntax ? 'has-error' : ''}`} style={{ flex: 1 }}>
            <label className="opaque">Path</label>
            <textarea
              className="app-input"
              style={{ height: 90 }}
              value={rawPath}
              placeholder="Paste any SVG path here"
              onChange={e => onRawPathChange(e.target.value)}
              onFocus={() => setHistoryDisabled(true)}
              onBlur={() => setHistoryDisabled(false)}
              title={invalidSyntax ? 'Invalid path syntax' : ''}
            />
          </div>
        </div>

        <div className="path-buttons" style={{ display: 'flex', alignItems: 'center', padding: '4px 6px', gap: 6 }}>
          <button
            className="mini-fab primary"
            style={{ width: 32, height: 32 }}
            title="Open saved path"
            onClick={onOpenDialog}
          >
            <FolderOpen size={16} />
          </button>
          <button
            className="mini-fab primary"
            style={{ width: 32, height: 32 }}
            title="Save path in browser"
            onClick={onSaveDialog}
          >
            <Save size={16} />
          </button>
          <button
            className="mini-fab primary"
            style={{ width: 32, height: 32 }}
            title="Clear path"
            onClick={onClearPath}
          >
            <Trash2 size={16} />
          </button>

          <div style={{ flex: 1 }} />

          <button
            ref={addBtnRef}
            className="mini-fab accent"
            style={{ width: 32, height: 32 }}
            title="Append new command"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              onOpenInsertMenu(null, { x: rect.left, y: rect.bottom + 4 });
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </Expandable>

      {/* 2. Configuration section */}
      <Expandable panelTitle="Configuration" defaultOpened={true}>
        <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 4 }}>
          <div className={`input-block ${config.viewPortLocked ? 'disabled' : ''}`}>
            <label>X</label>
            <NumberInput
              value={config.viewPortX}
              disabled={config.viewPortLocked}
              onChange={x => onUpdateViewPort(x, config.viewPortY, config.viewPortWidth, config.viewPortHeight)}
            />
          </div>
          <div className={`input-block ${config.viewPortLocked ? 'disabled' : ''}`}>
            <label>Y</label>
            <NumberInput
              value={config.viewPortY}
              disabled={config.viewPortLocked}
              onChange={y => onUpdateViewPort(config.viewPortX, y, config.viewPortWidth, config.viewPortHeight)}
            />
          </div>
          <div className={`input-block ${config.viewPortLocked ? 'disabled' : ''}`}>
            <label>Width</label>
            <NumberInput
              value={config.viewPortWidth}
              formatterType="positive-float"
              disabled={config.viewPortLocked}
              onChange={w => onUpdateViewPort(config.viewPortX, config.viewPortY, w, null)}
            />
          </div>
          <div className={`input-block ${config.viewPortLocked ? 'disabled' : ''}`}>
            <label>Height</label>
            <NumberInput
              value={config.viewPortHeight}
              formatterType="positive-float"
              disabled={config.viewPortLocked}
              onChange={h => onUpdateViewPort(config.viewPortX, config.viewPortY, null, h)}
            />
          </div>
          <button
            className="mat-flat-button"
            style={{ width: 32, padding: 0 }}
            title={config.viewPortLocked ? 'Unlock viewBox' : 'Lock viewBox'}
            onClick={() => onConfigChange('viewPortLocked', !config.viewPortLocked)}
          >
            {config.viewPortLocked ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
        </div>

        <div className="row" style={{ marginTop: 4 }}>
          <label className="checkbox-label" style={{ flex: 1 }}>
            <input
              type="checkbox"
              checked={config.snapToGrid}
              onChange={e => onConfigChange('snapToGrid', e.target.checked)}
            />
            Snap to Grid
          </label>
          <div className={`input-block ${config.snapToGrid ? 'disabled' : ''}`} style={{ flex: 1 }}>
            <label>Point Precision</label>
            <NumberInput
              value={config.decimalPrecision}
              formatterType="positive-integer"
              disabled={config.snapToGrid}
              onChange={p => onConfigChange('decimalPrecision', p)}
            />
          </div>
        </div>

        <div className="row" style={{ marginTop: 4 }}>
          <label className="checkbox-label" style={{ flex: 1 }}>
            <input
              type="checkbox"
              checked={config.renderColors}
              onChange={e => onConfigChange('renderColors', e.target.checked)}
            />
            Render SVG Colors
          </label>
          <label className="checkbox-label" style={{ flex: 1 }}>
            <input
              type="checkbox"
              checked={config.filled}
              onChange={e => onConfigChange('filled', e.target.checked)}
            />
            Fill Active Path
          </label>
        </div>

        <div className="row" style={{ marginTop: 4 }}>
          <label className="checkbox-label" style={{ flex: 1 }}>
            <input
              type="checkbox"
              checked={config.preview}
              onChange={e => onConfigChange('preview', e.target.checked)}
            />
            Preview
          </label>
          <label className="checkbox-label" style={{ flex: 1 }}>
            <input
              type="checkbox"
              checked={config.showLayersPanel}
              onChange={e => onConfigChange('showLayersPanel', e.target.checked)}
            />
            Show Layers Panel
          </label>
        </div>

        <div className="row" style={{ marginTop: 4 }}>
          <label className="checkbox-label" style={{ flex: 1 }}>
            <input
              type="checkbox"
              checked={config.showTicks}
              onChange={e => onConfigChange('showTicks', e.target.checked)}
            />
            Show Ticks
          </label>
          <label className="checkbox-label" style={{ flex: 1 }}>
            <input
              type="checkbox"
              checked={config.minifyOutput}
              onChange={e => {
                onConfigChange('minifyOutput', e.target.checked);
                onAfterModelChange();
              }}
            />
            Minify output
          </label>
        </div>
      </Expandable>

      {/* 3. Path Operations section */}
      <Expandable panelTitle="Path Operations" defaultOpened={true}>
        <div className="path-operations-grid">
          <div className="input-block">
            <label>Scale X</label>
            <NumberInput value={scaleX} onChange={setScaleX} onEnter={() => onScale(scaleX, scaleY)} />
          </div>
          <div className="input-block">
            <label>Scale Y</label>
            <NumberInput value={scaleY} onChange={setScaleY} onEnter={() => onScale(scaleX, scaleY)} />
          </div>
          <button className="mat-flat-button" onClick={() => onScale(scaleX, scaleY)}>
            Scale
          </button>
        </div>

        <div className="path-operations-grid">
          <div className="input-block">
            <label>Translate X</label>
            <NumberInput value={translateX} onChange={setTranslateX} onEnter={() => onTranslate(translateX, translateY)} />
          </div>
          <div className="input-block">
            <label>Translate Y</label>
            <NumberInput value={translateY} onChange={setTranslateY} onEnter={() => onTranslate(translateX, translateY)} />
          </div>
          <button className="mat-flat-button" onClick={() => onTranslate(translateX, translateY)}>
            Translate
          </button>
        </div>

        <div className="path-operations-grid4">
          <div className="input-block">
            <label>Origin X</label>
            <NumberInput value={rotateX} onChange={setRotateX} onEnter={() => onRotate(rotateX, rotateY, rotateAngle)} />
          </div>
          <div className="input-block">
            <label>Origin Y</label>
            <NumberInput value={rotateY} onChange={setRotateY} onEnter={() => onRotate(rotateX, rotateY, rotateAngle)} />
          </div>
          <div className="input-block">
            <label>Angle</label>
            <NumberInput suffix="°" value={rotateAngle} onChange={setRotateAngle} onEnter={() => onRotate(rotateX, rotateY, rotateAngle)} />
          </div>
          <button className="mat-flat-button" onClick={() => onRotate(rotateX, rotateY, rotateAngle)}>
            Rotate
          </button>
        </div>

        <div className="path-operations-grid">
          <div className="input-block" style={{ gridColumn: 'span 2' }}>
            <label>Number of decimals</label>
            <NumberInput
              value={roundDecimals}
              formatterType="positive-integer"
              onChange={setRoundDecimals}
              onEnter={() => onRound(roundDecimals)}
            />
          </div>
          <button className="mat-flat-button" onClick={() => onRound(roundDecimals)}>
            Round
          </button>
        </div>

        <div className="row" style={{ gap: 4, marginTop: 4 }}>
          <button className="mat-flat-button" style={{ flex: 1 }} onClick={() => onSetRelative(true)}>
            Convert to relative
          </button>
          <button className="mat-flat-button" style={{ flex: 1 }} onClick={() => onSetRelative(false)}>
            Convert to absolute
          </button>
        </div>

        <div className="row" style={{ gap: 4, marginTop: 4 }}>
          <button className="mat-flat-button" style={{ flex: 1 }} onClick={onReverse}>
            Reverse
          </button>
          <button className="mat-flat-button" style={{ flex: 1 }} onClick={onOptimize}>
            Optimize
          </button>
        </div>
      </Expandable>

      {/* 4. Commands section */}
      <Expandable panelTitle="Commands" defaultOpened={true}>
        {parsedPath.path.map((item, j) => {
          const commandType = item.getType() as SvgCommandTypeAny;
          const isArc = commandType.toLowerCase() === 'a';
          const isHovered = item === hoveredItem;
          const isFocused = item === focusedItem;

          return (
            <div
              key={`cmd_${j}`}
              id={`svg_command_row_${j}`}
              className={`row ${isHovered ? 'hovered' : ''} ${isFocused ? 'dragged' : ''}`}
              style={{ paddingTop: 1, paddingBottom: 1, cursor: 'default' }}
              onClick={() => onFocusItem(item)}
              onMouseEnter={() => onHoverItem(item)}
              onMouseLeave={() => onHoverItem(null)}
            >
              {/* Token badge */}
              <div
                className={`type-token ${item.relative ? 'type-token-relative' : ''}`}
                title="Click to toggle relative / absolute"
                onClick={e => {
                  e.stopPropagation();
                  item.setRelative(!item.relative);
                  onAfterModelChange();
                }}
              >
                {item.getType()}
              </div>

              {/* Arguments */}
              {item.values.map((val, i) => {
                const tooltipText = TOOLTIP_LABELS[commandType]?.[i] || '';
                const colIdx = isArc && i > 4 ? i - 1 : i;

                if (isArc && (i === 3 || i === 4)) {
                  return (
                    <input
                      key={`val_${j}_${i}`}
                      type="checkbox"
                      checked={Boolean(val)}
                      title={tooltipText}
                      style={{ margin: '0 4px', accentColor: '#2196f3' }}
                      onFocus={() => onFocusItem(item)}
                      onChange={e => handleSetValue(item, i, e.target.checked ? 1 : 0)}
                    />
                  );
                }

                return (
                  <NumberInput
                    key={`val_${j}_${i}`}
                    id={`svg_command_${j}_${colIdx}`}
                    className="svg-value app-input"
                    value={val}
                    title={tooltipText}
                    onFocus={() => onFocusItem(item)}
                    onChange={newVal => handleSetValue(item, i, newVal)}
                    onKeyDown={e => handleInputKeyDown(e, j, colIdx)}
                  />
                );
              })}

              <div style={{ flex: 1 }} />

              {/* Context menu trigger */}
              <button
                className="mini-fab primary"
                style={{ width: 22, height: 22, boxShadow: 'none', background: 'transparent' }}
                title="Command options"
                onClick={e => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  onOpenItemMenu(item, { x: rect.left, y: rect.bottom + 4 });
                }}
              >
                <MoreVertical size={14} />
              </button>
            </div>
          );
        })}
      </Expandable>

      <div style={{ height: 32 }} />

      {/* Footer */}
      <button
        type="button"
        className="footer"
        onClick={onOpenAbout}
        title="About SVGEdito"
      >
        <Logo size={14} fill="currentColor" />
        <span>SVGEdito v{APP_VERSION}</span>
      </button>
    </div>
  );
};
