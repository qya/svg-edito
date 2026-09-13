import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { StorageService } from '../../services/storage.service';
import { Layer } from '../../types/layer';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storageService: StorageService;
  currentName: string;
  path: string;
  layers?: Layer[];
  viewBox?: { x: number; y: number; width: number; height: number };
  docViewBox?: { x: number; y: number; width: number; height: number };
  onSaveSuccess: (savedName: string) => void;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({
  isOpen,
  onClose,
  storageService,
  currentName,
  path,
  layers,
  viewBox,
  docViewBox,
  onSaveSuccess
}) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      if (currentName) {
        setName(currentName);
      } else {
        let defaultName = 'My path';
        let i = 1;
        while (storageService.hasPath(defaultName)) {
          defaultName = `My path ${i}`;
          i++;
        }
        setName(defaultName);
      }
    }
  }, [isOpen, currentName, storageService]);

  const exists = storageService.hasPath(name);

  const handleSave = () => {
    if (!name.trim()) return;
    storageService.addPath(name.trim(), path, layers, viewBox, docViewBox);
    onSaveSuccess(name.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save path"
      width={400}
      actions={
        <>
          <button className="mat-flat-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="mat-flat-button"
            style={{ backgroundColor: '#007acc' }}
            disabled={!name.trim()}
            onClick={handleSave}
          >
            {exists ? 'Replace' : 'Save'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="input-block">
          <label>Name</label>
          <input
            className="app-input"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && name.trim()) {
                handleSave();
              }
            }}
          />
        </div>
        <p style={{ margin: 0, color: exists ? '#ffb74d' : '#aaaaaa', fontSize: 12 }}>
          {exists
            ? 'A path with this name already exists, press Replace to replace it.'
            : 'Press Save to save current path in your browser.'}
        </p>
      </div>
    </Modal>
  );
};
