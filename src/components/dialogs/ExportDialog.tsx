import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { NumberInput } from '../common/NumberInput';
import { PathPreview } from './PathPreview';
import { Layer } from '../../types/layer';
import { exportSvg } from '../../lib/svg-exporter';
import {
  ExportConfig,
  loadExportConfig,
  saveExportConfigProp
} from '../../services/config.service';
import { browserComputePathBoundingBox, computeDocumentBoundingBox } from '../../utils/svg-bbox';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  path: string;
  name: string;
  layers?: Layer[];
  activeLayerId?: string | null;
  documentViewBox?: { x: number; y: number; width: number; height: number };
  onShowToast: (msg: string) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  path,
  name,
  layers = [],
  activeLayerId,
  documentViewBox,
  onShowToast
}) => {
  const [cfg, setCfg] = useState<ExportConfig>(() => loadExportConfig());
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [exportMode, setExportMode] = useState<'full' | 'active'>('full');

  // Resolve layers to ensure active layer has the latest live path
  const resolvedLayers = useMemo(() => {
    const resolve = (list: Layer[]): Layer[] =>
      list.map(l => {
        if (l.id === activeLayerId) {
          return { ...l, d: path };
        }
        if (l.children) {
          return { ...l, children: resolve(l.children) };
        }
        return l;
      });
    return resolve(layers);
  }, [layers, activeLayerId, path]);

  const refreshViewboxForMode = useCallback(
    (mode: 'full' | 'active', currentCfg: ExportConfig = cfg) => {
      if (mode === 'full' && layers && layers.length > 0) {
        if (documentViewBox && documentViewBox.width > 0 && documentViewBox.height > 0) {
          setX(parseFloat(documentViewBox.x.toPrecision(6)) || 0);
          setY(parseFloat(documentViewBox.y.toPrecision(6)) || 0);
          setWidth(parseFloat(documentViewBox.width.toPrecision(6)) || 100);
          setHeight(parseFloat(documentViewBox.height.toPrecision(6)) || 100);
          return;
        }
        const docBbox = computeDocumentBoundingBox(layers);
        setX(parseFloat(docBbox.x.toPrecision(6)) || 0);
        setY(parseFloat(docBbox.y.toPrecision(6)) || 0);
        setWidth(parseFloat(Math.max(docBbox.width, 1).toPrecision(4)) || 100);
        setHeight(parseFloat(Math.max(docBbox.height, 1).toPrecision(4)) || 100);
        return;
      }

      // Active layer only mode
      const bbox = browserComputePathBoundingBox(path);
      let vx = bbox.x;
      let vy = bbox.y;
      let vw = bbox.width;
      let vh = bbox.height;

      if (currentCfg.stroke) {
        vx -= currentCfg.strokeWidth;
        vy -= currentCfg.strokeWidth;
        vw += 2 * currentCfg.strokeWidth;
        vh += 2 * currentCfg.strokeWidth;
      }

      setX(parseFloat(vx.toPrecision(6)) || 0);
      setY(parseFloat(vy.toPrecision(6)) || 0);
      setWidth(parseFloat(Math.max(vw, 1).toPrecision(4)) || 100);
      setHeight(parseFloat(Math.max(vh, 1).toPrecision(4)) || 100);
    },
    [cfg, layers, path, documentViewBox]
  );

  const fitBoundingBoxForMode = useCallback(
    (mode: 'full' | 'active', currentCfg: ExportConfig = cfg) => {
      if (mode === 'full' && layers && layers.length > 0) {
        const docBbox = computeDocumentBoundingBox(layers);
        setX(parseFloat(docBbox.x.toPrecision(6)) || 0);
        setY(parseFloat(docBbox.y.toPrecision(6)) || 0);
        setWidth(parseFloat(Math.max(docBbox.width, 1).toPrecision(4)) || 100);
        setHeight(parseFloat(Math.max(docBbox.height, 1).toPrecision(4)) || 100);
        return;
      }

      // Active layer only mode
      const bbox = browserComputePathBoundingBox(path);
      let vx = bbox.x;
      let vy = bbox.y;
      let vw = bbox.width;
      let vh = bbox.height;

      if (currentCfg.stroke) {
        vx -= currentCfg.strokeWidth;
        vy -= currentCfg.strokeWidth;
        vw += 2 * currentCfg.strokeWidth;
        vh += 2 * currentCfg.strokeWidth;
      }

      setX(parseFloat(vx.toPrecision(6)) || 0);
      setY(parseFloat(vy.toPrecision(6)) || 0);
      setWidth(parseFloat(Math.max(vw, 1).toPrecision(4)) || 100);
      setHeight(parseFloat(Math.max(vh, 1).toPrecision(4)) || 100);
    },
    [cfg, layers, path]
  );

  useEffect(() => {
    if (isOpen) {
      const loaded = loadExportConfig();
      // Initialize active path style from active layer if available
      const activeLayer = layers.find(l => l.id === activeLayerId);
      if (activeLayer) {
        if (activeLayer.fill && activeLayer.fill !== 'none') {
          loaded.fill = true;
          loaded.fillColor = activeLayer.fill;
        }
        if (activeLayer.stroke && activeLayer.stroke !== 'none') {
          loaded.stroke = true;
          loaded.strokeColor = activeLayer.stroke;
          if (activeLayer.strokeWidth !== undefined) {
            loaded.strokeWidth = activeLayer.strokeWidth;
          }
        }
      }
      setCfg(loaded);

      const initialMode: 'full' | 'active' = layers.length > 1 ? 'full' : 'active';
      setExportMode(initialMode);
      refreshViewboxForMode(initialMode, loaded);
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeChange = (newMode: 'full' | 'active') => {
    setExportMode(newMode);
    refreshViewboxForMode(newMode);
  };

  const updateCfg = <K extends keyof ExportConfig>(key: K, value: ExportConfig[K]) => {
    const next = { ...cfg, [key]: value };
    setCfg(next);
    saveExportConfigProp(key, value);
  };

  const makeSVG = (): string => {
    if (exportMode === 'full' && resolvedLayers.length > 0) {
      return exportSvg({
        viewBox: { x, y, width, height },
        layers: resolvedLayers
      });
    }

    const strokeAttr = cfg.stroke ? ` stroke="${cfg.strokeColor}" stroke-width="${cfg.strokeWidth}"` : '';
    const fillAttr = cfg.fill ? cfg.fillColor : 'none';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}">\n  <path d="${path}"${strokeAttr} fill="${fillAttr}"/>\n</svg>`;
  };

  const handleDownload = () => {
    const svg = makeSVG();
    const fileName = (name ? name.replace(/[\\/:*?"<>|]/g, '_') : 'vector-export') + '.svg';
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const anchor = document.createElement('a');
    anchor.href = window.URL.createObjectURL(blob);
    anchor.setAttribute('download', fileName);
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => window.URL.revokeObjectURL(anchor.href), 100);
    onClose();
  };

  const handleCopy = () => {
    const svg = makeSVG();
    navigator.clipboard.writeText(svg);
    onShowToast('Copied to clipboard');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export as SVG"
      width={780}
      actions={
        <>
          <button className="mat-flat-button" onClick={onClose}>
            Cancel
          </button>
          <button className="mat-flat-button" onClick={handleCopy}>
            Copy to clipboard
          </button>
          <button
            className="mat-flat-button"
            style={{ backgroundColor: '#007acc' }}
            onClick={handleDownload}
          >
            Download
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Settings form */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Scope selection */}
          {layers.length > 1 && (
            <div>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  fontSize: 13,
                  borderBottom: '1px solid #3e3e42',
                  paddingBottom: 4
                }}
              >
                Export Scope
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="exportMode"
                    value="full"
                    checked={exportMode === 'full'}
                    onChange={() => handleModeChange('full')}
                  />
                  Full SVG Document ({layers.length} layers)
                </label>
                <label className="checkbox-label">
                  <input
                    type="radio"
                    name="exportMode"
                    value="active"
                    checked={exportMode === 'active'}
                    onChange={() => handleModeChange('active')}
                  />
                  Active Layer Only
                </label>
              </div>
            </div>
          )}

          {exportMode === 'full' && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: '#252526',
                border: '1px solid #3e3e42',
                borderRadius: 4,
                fontSize: 12,
                color: '#cccccc',
                lineHeight: 1.5
              }}
            >
              <strong>Full Document Export:</strong> Preserves all{' '}
              {resolvedLayers.filter(l => l.visible).length} visible layers with their respective vector
              geometry, styling, colors, and transforms.
            </div>
          )}

          {exportMode === 'active' && (
            <div>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  fontSize: 13,
                  borderBottom: '1px solid #3e3e42',
                  paddingBottom: 4
                }}
              >
                Active Path Style
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                <label className="checkbox-label" style={{ width: 70 }}>
                  <input
                    type="checkbox"
                    checked={cfg.fill}
                    onChange={e => {
                      const fill = e.target.checked;
                      updateCfg('fill', fill);
                      if (!fill && !cfg.stroke) {
                        updateCfg('stroke', true);
                      }
                    }}
                  />
                  Fill
                </label>
                <div className="input-block" style={{ flex: 1 }}>
                  <label>Fill Color</label>
                  <input
                    className="app-input"
                    value={cfg.fillColor}
                    disabled={!cfg.fill}
                    onChange={e => updateCfg('fillColor', e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label className="checkbox-label" style={{ width: 70 }}>
                  <input
                    type="checkbox"
                    checked={cfg.stroke}
                    onChange={e => {
                      const stroke = e.target.checked;
                      updateCfg('stroke', stroke);
                      if (!stroke && !cfg.fill) {
                        updateCfg('fill', true);
                      }
                    }}
                  />
                  Stroke
                </label>
                <div className="input-block" style={{ flex: 1 }}>
                  <label>Stroke Color</label>
                  <input
                    className="app-input"
                    value={cfg.strokeColor}
                    disabled={!cfg.stroke}
                    onChange={e => updateCfg('strokeColor', e.target.value)}
                  />
                </div>
                <div className="input-block" style={{ width: 80 }}>
                  <label>Stroke Width</label>
                  <NumberInput
                    value={cfg.strokeWidth}
                    formatterType="positive-float"
                    disabled={!cfg.stroke}
                    onChange={val => updateCfg('strokeWidth', val)}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                borderBottom: '1px solid #3e3e42',
                paddingBottom: 4
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 13 }}>ViewBox</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="mat-flat-button"
                  style={{ height: 24, fontSize: 11, padding: '0 8px' }}
                  onClick={() => fitBoundingBoxForMode(exportMode)}
                  title="Fit viewBox tightly to vector contents"
                >
                  Fit Content
                </button>
                <button
                  type="button"
                  className="mat-flat-button"
                  style={{ height: 24, fontSize: 11, padding: '0 8px' }}
                  onClick={() => refreshViewboxForMode(exportMode)}
                  title="Reset to default document viewBox"
                >
                  Reset
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="input-block">
                <label>X</label>
                <NumberInput value={x} onChange={setX} />
              </div>
              <div className="input-block">
                <label>Y</label>
                <NumberInput value={y} onChange={setY} />
              </div>
              <div className="input-block">
                <label>Width</label>
                <NumberInput value={width} formatterType="positive-float" onChange={setWidth} />
              </div>
              <div className="input-block">
                <label>Height</label>
                <NumberInput value={height} formatterType="positive-float" onChange={setHeight} />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Preview matching user selection */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <PathPreview
            mode={exportMode}
            layers={resolvedLayers}
            activeLayerId={activeLayerId}
            path={path}
            x={x}
            y={y}
            width={width}
            height={height}
            fillColor={cfg.fill ? cfg.fillColor : 'none'}
            strokeColor={cfg.stroke ? cfg.strokeColor : 'none'}
            strokeWidth={cfg.strokeWidth}
            size={300}
          />
          <div style={{ marginTop: 8, fontSize: 11, color: '#888888' }}>
            {exportMode === 'full'
              ? `Previewing full document (${resolvedLayers.filter(l => l.visible).length} layers)`
              : 'Previewing active layer only'}
          </div>
        </div>
      </div>
    </Modal>
  );
};
