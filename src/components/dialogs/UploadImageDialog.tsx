import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { NumberInput } from '../common/NumberInput';
import { Image } from '../../types/image';
import { Upload } from 'lucide-react';

interface UploadImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImage: (image: Image) => void;
}

export const UploadImageDialog: React.FC<UploadImageDialogProps> = ({
  isOpen,
  onClose,
  onAddImage
}) => {
  const [data, setData] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(20);
  const [preserveAspectRatio, setPreserveAspectRatio] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (file && /^image\//.test(file.type)) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result?.toString() ?? null;
        setData(result);
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImport = () => {
    if (!data) return;
    onAddImage({
      data,
      x1: x,
      y1: y,
      x2: x + width,
      y2: y + height,
      preserveAspectRatio,
      opacity: 1.0
    });
    onClose();
    // Reset state
    setData(null);
    setFileName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import image"
      width={540}
      actions={
        <>
          <button className="mat-flat-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="mat-flat-button"
            style={{ backgroundColor: '#007acc' }}
            disabled={!data}
            onClick={handleImport}
          >
            Import
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Drag & drop upload area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #444444',
            borderRadius: 6,
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: '#1f1f1f',
            transition: 'border-color 150ms'
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#007acc')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#444444')}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                processFile(e.target.files[0]);
              }
            }}
          />
          {data ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <img
                src={data}
                alt="preview"
                style={{ maxWidth: 80, maxHeight: 80, objectFit: 'contain', borderRadius: 4 }}
              />
              <span style={{ fontSize: 13, color: '#ffffff' }}>{fileName}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#aaaaaa' }}>
              <Upload size={32} />
              <span>Drop an image here or click to browse</span>
            </div>
          )}
        </div>

        {/* Coordinates and size */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

        <div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preserveAspectRatio}
              onChange={e => setPreserveAspectRatio(e.target.checked)}
            />
            Preserve Aspect Ratio
          </label>
        </div>
      </div>
    </Modal>
  );
};
