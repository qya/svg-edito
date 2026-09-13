import { Layer, SvgDocument } from '../types/layer';

export interface ExportOptions {
  activeLayerId?: string;
  exportActiveOnly?: boolean;
  includeHidden?: boolean;
}

function layerToSvgMarkup(layer: Layer, indent = '  ', options?: ExportOptions): string {
  if (!layer.visible && !options?.includeHidden) {
    return '';
  }

  const attrs: string[] = [];
  if (layer.id) attrs.push(`id="${layer.id}"`);
  if (layer.name) attrs.push(`data-name="${layer.name}"`);

  if (layer.type === 'group') {
    if (layer.transform) attrs.push(`transform="${layer.transform}"`);
    if (layer.opacity !== undefined) attrs.push(`opacity="${layer.opacity}"`);
    if (!layer.visible) attrs.push('display="none"');

    const childrenMarkup = (layer.children || [])
      .map(child => layerToSvgMarkup(child, indent + '  ', options))
      .filter(Boolean)
      .join('\n');

    return `${indent}<g ${attrs.join(' ')}>\n${childrenMarkup}\n${indent}</g>`;
  }

  // Path / converted shape layer
  if (!layer.d.trim()) return '';

  attrs.push(`d="${layer.d.trim()}"`);
  if (layer.fill) {
    attrs.push(`fill="${layer.fill}"`);
  } else if (layer.stroke) {
    attrs.push('fill="none"');
  }
  if (layer.stroke) attrs.push(`stroke="${layer.stroke}"`);
  if (layer.strokeWidth !== undefined) attrs.push(`stroke-width="${layer.strokeWidth}"`);
  if (layer.opacity !== undefined) attrs.push(`opacity="${layer.opacity}"`);
  if (layer.transform) attrs.push(`transform="${layer.transform}"`);
  if (!layer.visible) attrs.push('display="none"');

  return `${indent}<path ${attrs.join(' ')} />`;
}

export function exportSvg(doc: SvgDocument, options?: ExportOptions): string {
  const { viewBox, layers } = doc;
  const vbStr = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

  if (options?.exportActiveOnly && options.activeLayerId) {
    const findLayer = (list: Layer[]): Layer | null => {
      for (const l of list) {
        if (l.id === options.activeLayerId) return l;
        if (l.children) {
          const found = findLayer(l.children);
          if (found) return found;
        }
      }
      return null;
    };
    const active = findLayer(layers);
    if (active) {
      const activeMarkup = layerToSvgMarkup(active, '  ', options);
      return (
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbStr}">\n` +
        `${activeMarkup}\n` +
        `</svg>`
      );
    }
  }

  const layersMarkup = layers
    .map(layer => layerToSvgMarkup(layer, '  ', options))
    .filter(Boolean)
    .join('\n');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbStr}">\n` +
    `${layersMarkup}\n` +
    `</svg>`
  );
}
