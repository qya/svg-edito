import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { parseSvg } from '../../lib/svg-parser';
import { SvgDocument } from '../../types/layer';
import { Upload, FileCode, CheckCircle, AlertCircle } from 'lucide-react';

interface ImportSvgDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (doc: SvgDocument) => void;
}

export const ImportSvgDialog: React.FC<ImportSvgDialogProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [svgInput, setSvgInput] = useState('');
  const [parsedDoc, setParsedDoc] = useState<SvgDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (content: string) => {
    setSvgInput(content);
    if (!content.trim()) {
      setParsedDoc(null);
      setError(null);
      return;
    }
    try {
      const doc = parseSvg(content);
      if (doc.layers.length === 0) {
        setError('No valid graphical elements found in the SVG.');
        setParsedDoc(null);
      } else {
        setError(null);
        setParsedDoc(doc);
      }
    } catch (err) {
      setError('Failed to parse SVG markup.');
      setParsedDoc(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        handleInputChange(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirm = () => {
    if (parsedDoc) {
      onImport(parsedDoc);
      onClose();
      setSvgInput('');
      setParsedDoc(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Full SVG Document"
      width={680}
      actions={
        <>
          <button className="mat-flat-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="mat-flat-button"
            style={{ backgroundColor: '#007acc' }}
            disabled={!parsedDoc || parsedDoc.layers.length === 0}
            onClick={handleConfirm}
          >
            Import Document
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ margin: 0, color: '#c8c8c8', fontSize: 12 }}>
          Upload an SVG file or paste raw SVG XML below to load all layers, shapes, and paths.
        </p>

        {/* Upload File Zone */}
        <div
          style={{
            border: '2px dashed #444',
            borderRadius: 6,
            padding: '20px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            transition: 'border-color 150ms'
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = ev => {
                const text = ev.target?.result as string;
                if (text) handleInputChange(text);
              };
              reader.readAsText(file);
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <Upload size={24} color="#007acc" />
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            Click to upload or drag & drop SVG file
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>
            Supports paths, rects, circles, ellipses, lines, polylines, polygons, and groups
          </div>
        </div>

        {/* Paste Raw SVG Markup */}
        <div>
          <label style={{ display: 'block', fontSize: 11, color: '#aaa', marginBottom: 6 }}>
            Or paste SVG markup:
          </label>
          <textarea
            className="app-input"
            style={{
              width: '100%',
              height: 120,
              fontFamily: 'monospace',
              fontSize: 11,
              backgroundColor: '#181818',
              padding: 8
            }}
            placeholder={'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  <path d="..." />\n</svg>'}
            value={svgInput}
            onChange={e => handleInputChange(e.target.value)}
          />
        </div>

        {/* Status / Parse Summary */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ff5252', fontSize: 12 }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {parsedDoc && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              backgroundColor: 'rgba(78, 201, 176, 0.15)',
              border: '1px solid #4ec9b0',
              borderRadius: 4,
              color: '#4ec9b0',
              fontSize: 12
            }}
          >
            <CheckCircle size={16} />
            <div>
              <strong>Valid SVG detected:</strong> {parsedDoc.layers.length} layer(s) ready to import.
              ViewBox: {parsedDoc.viewBox.x} {parsedDoc.viewBox.y} {parsedDoc.viewBox.width} {parsedDoc.viewBox.height}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
