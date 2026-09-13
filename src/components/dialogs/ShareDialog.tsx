import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { PathPreview } from './PathPreview';
import { Copy } from 'lucide-react';
import { Layer } from '../../types/layer';
import { encodeSharePayload } from '../../utils/share-url';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  path: string;
  name?: string;
  layers?: Layer[];
  activeLayerId?: string | null;
  documentViewBox?: { x: number; y: number; width: number; height: number };
  onShowToast: (msg: string) => void;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  onClose,
  path,
  name,
  layers = [],
  activeLayerId,
  documentViewBox,
  onShowToast
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shareMode, setShareMode] = useState<'active' | 'full'>('active');

  // Keep live path updated in active layer
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

  useEffect(() => {
    if (isOpen) {
      if (layers.length > 1) {
        setShareMode('full');
      } else {
        setShareMode('active');
      }
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, layers.length]);

  const url = useMemo(() => {
    if (shareMode === 'full' && resolvedLayers.length > 0) {
      return encodeSharePayload({
        type: 'document',
        name,
        viewBox: documentViewBox || { x: 0, y: 0, width: 100, height: 100 },
        layers: resolvedLayers,
        activeLayerId
      });
    }

    return encodeSharePayload({
      type: 'path',
      name,
      path
    });
  }, [shareMode, resolvedLayers, name, documentViewBox, activeLayerId, path]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    onShowToast('Share link copied to clipboard');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share as URL"
      width={720}
      actions={
        <>
          <button className="mat-flat-button" onClick={onClose}>
            Close
          </button>
          <button
            className="mat-flat-button"
            style={{ backgroundColor: '#007acc' }}
            onClick={handleCopy}
          >
            Copy link
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <PathPreview
          mode={shareMode}
          layers={resolvedLayers}
          activeLayerId={activeLayerId}
          path={path}
          size={240}
        />
        <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Share mode selector */}
          <div>
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                fontSize: 13,
                color: '#e0e0e0',
                borderBottom: '1px solid #3e3e42',
                paddingBottom: 4
              }}
            >
              Share Content
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <label className="checkbox-label" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="radio"
                  name="shareMode"
                  value="active"
                  checked={shareMode === 'active'}
                  onChange={() => setShareMode('active')}
                />
                Selected path only
              </label>
              <label
                className="checkbox-label"
                style={{
                  cursor: layers.length > 0 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: layers.length > 0 ? 1 : 0.6
                }}
              >
                <input
                  type="radio"
                  name="shareMode"
                  value="full"
                  checked={shareMode === 'full'}
                  disabled={layers.length === 0}
                  onChange={() => setShareMode('full')}
                />
                Full SVG layers ({layers.length || 1})
              </label>
            </div>
          </div>

          <p style={{ color: '#aaa', margin: '4px 0 0 0', fontSize: 13 }}>
            {shareMode === 'full'
              ? 'Creates a compressed URL containing all SVG layers, positions, and styles.'
              : 'Creates a compressed URL containing only the active SVG path.'}
          </p>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div className="input-block" style={{ flex: 1 }}>
              <label>Share URL (compressed with lz-string)</label>
              <input
                ref={inputRef}
                className="app-input"
                readOnly
                value={url}
                onClick={e => (e.target as HTMLInputElement).select()}
              />
            </div>
            <button
              className="mini-fab primary"
              style={{ width: 34, height: 34, flexShrink: 0, marginTop: 18 }}
              title="Copy to clipboard"
              onClick={handleCopy}
            >
              <Copy size={16} />
            </button>
          </div>

          <div style={{ fontSize: 11, color: '#888', display: 'flex', justifyContent: 'space-between' }}>
            <span>URL length: {url.length} characters</span>
            <span style={{ color: '#4caf50' }}>Ready to share</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
