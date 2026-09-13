import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StorageService, StoredPath } from '../../services/storage.service';
import { SvgPath } from '../../lib/svg';
import { Layer } from '../../types/layer';
import { Trash2, Check, X } from 'lucide-react';

interface OpenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  storageService: StorageService;
  onSelectPath: (
    name: string,
    path: string,
    layers?: Layer[],
    viewBox?: { x: number; y: number; width: number; height: number },
    docViewBox?: { x: number; y: number; width: number; height: number }
  ) => void;
}

export const OpenDialog: React.FC<OpenDialogProps> = ({
  isOpen,
  onClose,
  storageService,
  onSelectPath
}) => {
  const [paths, setPaths] = useState<StoredPath[]>(() =>
    storageService.storedPaths.filter(it => Boolean(it.name))
  );
  const [beingRemoved, setBeingRemoved] = useState<string | null>(null);

  const handleRemove = (name: string) => {
    storageService.removePath(name);
    setPaths(storageService.storedPaths.filter(it => Boolean(it.name)));
    setBeingRemoved(null);
  };

  const computeViewBox = (path: string): string => {
    try {
      const p = new SvgPath(path);
      const locs = p.targetLocations();
      if (locs.length > 0) {
        const minx = locs.reduce((acc, pt) => Math.min(acc, pt.x), Infinity);
        const miny = locs.reduce((acc, pt) => Math.min(acc, pt.y), Infinity);
        const maxx = locs.reduce((acc, pt) => Math.max(acc, pt.x), -Infinity);
        const maxy = locs.reduce((acc, pt) => Math.max(acc, pt.y), -Infinity);
        return `${minx} ${miny} ${maxx - minx} ${maxy - miny}`;
      }
    } catch {
      // ignore
    }
    return '0 0 100 100';
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    }).format(new Date(date));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Open path"
      width={780}
      actions={
        <button className="mat-flat-button" onClick={onClose}>
          Cancel
        </button>
      }
    >
      {paths.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#888888' }}>
          No saved paths found in browser storage.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #3e3e42', color: '#aaaaaa', textAlign: 'left' }}>
              <th style={{ width: 60, padding: '8px 4px' }}></th>
              <th style={{ padding: '8px 8px' }}>Name</th>
              <th style={{ width: 180, padding: '8px 8px' }}>Creation Date</th>
              <th style={{ width: 180, padding: '8px 8px' }}>Change Date</th>
              <th style={{ width: 100, padding: '8px 8px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paths.map((element, idx) => (
              <tr
                key={idx}
                onClick={() => {
                  if (element.name && (element.path || (element.layers && element.layers.length > 0))) {
                    onSelectPath(element.name, element.path, element.layers, element.viewBox, element.docViewBox);
                    onClose();
                  }
                }}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid #333333',
                  transition: 'background-color 100ms'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#37373d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <td style={{ padding: '4px' }}>
                  <svg
                    viewBox={
                      element.viewBox
                        ? `${element.viewBox.x} ${element.viewBox.y} ${element.viewBox.width} ${element.viewBox.height}`
                        : computeViewBox(element.path)
                    }
                    style={{ margin: '4px', width: 44, height: 44, display: 'block', backgroundColor: '#181818', borderRadius: 2 }}
                  >
                    {element.layers && element.layers.length > 0 ? (
                      element.layers.map(layer => {
                        if (!layer.visible) return null;
                        if (layer.type === 'group') {
                          return (
                            <g key={layer.id} transform={layer.transform} opacity={layer.opacity}>
                              {layer.children?.map(ch => (
                                <path
                                  key={ch.id}
                                  d={ch.d}
                                  fill={ch.fill || 'none'}
                                  stroke={ch.stroke || 'none'}
                                  strokeWidth={ch.strokeWidth || 1}
                                  opacity={ch.opacity}
                                />
                              ))}
                            </g>
                          );
                        }
                        return (
                          <path
                            key={layer.id}
                            d={layer.d}
                            fill={layer.fill || 'none'}
                            stroke={layer.stroke || (layer.fill && layer.fill !== 'none' ? 'none' : '#ffffff')}
                            strokeWidth={layer.strokeWidth || 1}
                            opacity={layer.opacity}
                          />
                        );
                      })
                    ) : (
                      <path d={element.path} fill="white" />
                    )}
                  </svg>
                </td>
                <td style={{ padding: '8px', fontWeight: 500 }}>{element.name}</td>
                <td style={{ padding: '8px', color: '#aaaaaa' }}>{formatDate(element.creationDate)}</td>
                <td style={{ padding: '8px', color: '#aaaaaa' }}>{formatDate(element.changeDate)}</td>
                <td style={{ padding: '8px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                  {beingRemoved === element.name ? (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        className="mini-fab primary"
                        style={{ width: 28, height: 28 }}
                        title="Cancel"
                        onClick={() => setBeingRemoved(null)}
                      >
                        <X size={14} />
                      </button>
                      <button
                        className="mini-fab warn"
                        style={{ width: 28, height: 28 }}
                        title="Confirm Deletion"
                        onClick={() => element.name && handleRemove(element.name)}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      className="mini-fab primary"
                      style={{ width: 28, height: 28 }}
                      title="Delete"
                      onClick={() => setBeingRemoved(element.name)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
};
