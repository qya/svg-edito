import React from 'react';
import { Modal } from '../common/Modal';
import { PathPreview } from './PathPreview';
import { Layer } from '../../types/layer';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  path?: string;
  layers?: Layer[];
  mode?: 'path' | 'document';
  name?: string;
  onConfirm: () => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onClose,
  path = '',
  layers = [],
  mode = 'path',
  name,
  onConfirm
}) => {
  const isDocument = mode === 'document' && layers.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDocument ? `Import shared SVG layers${name ? ` (${name})` : ''}` : `Import shared path${name ? ` (${name})` : ''}`}
      width={650}
      actions={
        <>
          <button className="mat-flat-button" onClick={onClose}>
            Discard
          </button>
          <button
            className="mat-flat-button"
            style={{ backgroundColor: '#007acc' }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Import
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <PathPreview
          mode={isDocument ? 'full' : 'active'}
          layers={layers}
          path={path}
          size={240}
        />
        <div style={{ padding: '0 16px', flex: 1 }}>
          <p style={{ color: '#ffffff', fontSize: 13, marginTop: 0 }}>
            {isDocument
              ? `Press Import to load ${layers.length} SVG layer${layers.length > 1 ? 's' : ''} and viewBox into the editor.`
              : 'Press Import to import this SVG path into the editor.'}
          </p>
          <p style={{ color: '#ffb74d', fontSize: 12 }}>
            Please note it will erase any unsaved changes.
          </p>
        </div>
      </div>
    </Modal>
  );
};
