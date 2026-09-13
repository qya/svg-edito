import React, { useState, useRef } from 'react';
import { SAMPLE_SVGS, SvgSampleItem } from '../../constants/samples.const';
import { parseSvg } from '../../lib/svg-parser';
import { SvgDocument } from '../../types/layer';
import {
  Sparkles,
  FolderOpen,
  FilePlus2,
  Upload,
  ArrowRight,
  Layers,
  Shapes,
  Palette,
  Check,
  X
} from 'lucide-react';

interface StartupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SvgSampleItem) => void;
  onOpenSaved: () => void;
  onImportSvgFile: (doc: SvgDocument) => void;
  onNewBlank: () => void;
  savedPathsCount?: number;
}

export const StartupDialog: React.FC<StartupDialogProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  onOpenSaved,
  onImportSvgFile,
  onNewBlank,
  savedPathsCount = 0
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_SVGS[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'samples' | 'open' | 'import'>('samples');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const selectedSample = SAMPLE_SVGS.find(s => s.id === selectedSampleId) || SAMPLE_SVGS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      if (text) {
        try {
          const doc = parseSvg(text);
          if (doc.layers.length > 0) {
            onImportSvgFile(doc);
            onClose();
          }
        } catch {
          // ignore
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        if (text) {
          try {
            const doc = parseSvg(text);
            if (doc.layers.length > 0) {
              onImportSvgFile(doc);
              onClose();
            }
          } catch {
            // ignore
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      className="modal-overlay startup-dialog-overlay"
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-card startup-dialog-card">
        {/* Header */}
        <div className="startup-dialog-header">
          <div className="startup-brand">
            <div className="startup-logo-badge">
              <svg viewBox="0 0 100 100" width="28" height="28">
                <path
                  fill="#ffffff"
                  d="m78.5 8c-4.9-3.6-10.4-6.4-18.5-6.4-3.6 0-8.9 0.7-13.2 2.5s-12.2 6.1-15.8 8-5.1 3.2-6.6 4.2c-1.4 1.1-3.4 2.7-5.9 5.3-1.5 1.8-3.1 3.8-4.1 5.6-1.2 2.2-2.4 5.2-2.4 5.7-0.7 2.5-1.4 5.5-1.4 9.1 0 2.9 0.6 7.9 3.3 12.4 3.5 5.2 7.1 7.5 10.2 9l9.9 5 5.9 3c1.7 1 3.2 1.7 6 1.7 1.8-0.1 3-0.7 4.1-1.2l6.9-2.9 7.3-4c4.9-2.1 3.7-6.9 0.8-9.2-1.4-1.1-4.3-3-6.8-2.3l-2.2 1-2.4 1.2c-1.7 0.8-3.6 1.4-5.8 1.4-3.3 0-5.2-0.9-6.8-1.6l-3.8-1.8c-5.1-2.5-7.6-3.3-10.5-7-0.5-0.8-1.1-1.8-1.4-2.7-0.9-3-0.7-6 0.9-9.4 1.9-3.1 3.6-4.5 7.3-6.6 1.4-0.5 3.1-1.4 4.5-2.1 1.1-0.5 2.5-1.2 3.6-1.8 1.3-0.6 2.8-1.3 4-2 1.8-0.9 3.3-1.7 5.3-2.7 2.1-1 4.5-1.6 7-1.6 2.7 0 4.7 0.6 7.5 2.1l5.2 3.2 6.4 4.1 3.4 2.3c0.9 0.6 1.1 0.5 2-0.6l1.5-1.5 1.6-1.9c0.6-0.5 1.2-1.5 2-2.3 1-1 2.1-3.3 0.4-5.6-1.8-2.5-4.9-6.1-9.4-9.6z"
                />
              </svg>
            </div>
            <div>
              <h2 className="startup-title">Welcome to SVGEdito</h2>
              <p className="startup-subtitle">
                Create, edit, and optimize precision SVG paths & vector layers
              </p>
            </div>
          </div>
          <button
            className="startup-close-btn"
            onClick={onClose}
            title="Dismiss startup dialog"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Body */}
        <div className="startup-dialog-body">
          {/* Action Choice Tabs */}
          <div className="startup-choice-tabs">
            <button
              type="button"
              className={`startup-choice-btn ${activeTab === 'samples' ? 'active' : ''}`}
              onClick={() => setActiveTab('samples')}
            >
              <Sparkles size={16} className="btn-icon" />
              <div className="btn-text">
                <span className="btn-title">Sample SVG</span>
                <span className="btn-desc">Explore pre-crafted vector examples</span>
              </div>
            </button>

            <button
              type="button"
              className={`startup-choice-btn ${activeTab === 'open' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('open');
                onOpenSaved();
              }}
            >
              <FolderOpen size={16} className="btn-icon" />
              <div className="btn-text">
                <span className="btn-title">Open SVG</span>
                <span className="btn-desc">
                  {savedPathsCount > 0
                    ? `${savedPathsCount} saved document${savedPathsCount > 1 ? 's' : ''} in browser`
                    : 'Open saved or upload SVG file'}
                </span>
              </div>
            </button>

            <button
              type="button"
              className={`startup-choice-btn ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              <Upload size={16} className="btn-icon" />
              <div className="btn-text">
                <span className="btn-title">Upload File</span>
                <span className="btn-desc">Import any .svg file from your device</span>
              </div>
            </button>
          </div>

          {/* Tab Content 1: Samples Grid */}
          {activeTab === 'samples' && (
            <div className="startup-samples-section">
              <div className="startup-section-label">
                <span>Select a sample template to start editing:</span>
              </div>

              <div className="startup-samples-grid">
                {SAMPLE_SVGS.map(sample => {
                  const isSelected = sample.id === selectedSampleId;
                  return (
                    <div
                      key={sample.id}
                      className={`startup-sample-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSampleId(sample.id)}
                      onDoubleClick={() => {
                        onSelectSample(sample);
                        onClose();
                      }}
                    >
                      <div className="sample-card-preview">
                        <svg
                          viewBox={`${sample.viewBox.x} ${sample.viewBox.y} ${sample.viewBox.width} ${sample.viewBox.height}`}
                          width="56"
                          height="56"
                        >
                          {sample.layers && sample.layers.length > 0 ? (
                            sample.layers.map(l => (
                              <path
                                key={l.id}
                                d={l.d}
                                fill={l.fill || 'none'}
                                stroke={l.stroke || (l.fill ? 'none' : '#ffffff')}
                                strokeWidth={l.strokeWidth || 1}
                              />
                            ))
                          ) : (
                            <path
                              d={sample.d}
                              fill={sample.fill || 'none'}
                              stroke={sample.stroke || (sample.fill ? 'none' : '#ffffff')}
                              strokeWidth={sample.strokeWidth || 1.5}
                            />
                          )}
                        </svg>
                        {isSelected && (
                          <div className="sample-selected-badge">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="sample-card-info">
                        <div className="sample-card-title">{sample.title}</div>
                        <div className="sample-card-category">{sample.category}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedSample && (
                <div className="startup-sample-detail-bar">
                  <div className="sample-detail-desc">
                    <strong>{selectedSample.title}:</strong> {selectedSample.description}
                  </div>
                  <button
                    className="mat-flat-button startup-load-btn"
                    onClick={() => {
                      onSelectSample(selectedSample);
                      onClose();
                    }}
                  >
                    Load Sample <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab Content 2: Open SVG Info */}
          {activeTab === 'open' && (
            <div className="startup-open-section">
              <div className="startup-open-banner">
                <FolderOpen size={32} color="#007acc" />
                <div className="open-banner-info">
                  <h3>Browse Saved Projects</h3>
                  <p>
                    {savedPathsCount > 0
                      ? `You have ${savedPathsCount} saved vector path(s) stored in your browser local storage.`
                      : 'No saved paths were found in your browser local storage yet.'}
                  </p>
                </div>
                <button
                  className="mat-flat-button startup-load-btn"
                  onClick={() => {
                    onOpenSaved();
                    onClose();
                  }}
                >
                  Launch Open Dialog <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Tab Content 3: Import / Upload SVG */}
          {activeTab === 'import' && (
            <div className="startup-upload-section">
              <div
                className={`startup-drop-zone ${dragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".svg,image/svg+xml"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <Upload size={32} color="#007acc" />
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  Click to choose an SVG file or drag & drop here
                </div>
                <div style={{ fontSize: 12, color: '#888888' }}>
                  Parses full SVG documents including shapes, paths, styles, and viewBox
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer with New Blank button */}
        <div className="startup-dialog-footer">
          <div className="startup-footer-left">
            <span className="startup-hint">Tip: You can re-open this anytime using the Start button on the top left.</span>
          </div>

          <div className="startup-footer-actions">
            <button
              className="startup-new-blank-btn"
              onClick={() => {
                onNewBlank();
                onClose();
              }}
              title="Start with an empty canvas"
            >
              <FilePlus2 size={16} />
              <span>New Blank</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
