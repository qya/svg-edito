import { Layer } from '../types/layer';

export function browserComputePathBoundingBox(path: string): DOMRect {
  try {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(svgNS, 'svg');
    svgEl.style.position = 'absolute';
    svgEl.style.width = '0px';
    svgEl.style.height = '0px';
    svgEl.style.visibility = 'hidden';
    const pathEl = document.createElementNS(svgNS, 'path');
    pathEl.setAttributeNS(null, 'd', path || 'M0 0');
    svgEl.appendChild(pathEl);
    document.body.appendChild(svgEl);
    const result = pathEl.getBBox();
    svgEl.remove();
    return result;
  } catch {
    return new DOMRect(0, 0, 0, 0);
  }
}

export function computeDocumentBoundingBox(layers: Layer[]): { x: number; y: number; width: number; height: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const processList = (list: Layer[]) => {
    for (const l of list) {
      if (l.d && l.visible) {
        const bbox = browserComputePathBoundingBox(l.d);
        if (bbox.width > 0 || bbox.height > 0) {
          minX = Math.min(minX, bbox.x);
          minY = Math.min(minY, bbox.y);
          maxX = Math.max(maxX, bbox.x + bbox.width);
          maxY = Math.max(maxY, bbox.y + bbox.height);
        }
      }
      if (l.children && l.visible) {
        processList(l.children);
      }
    }
  };

  processList(layers);

  if (minX === Infinity) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(maxX - minX, 4),
    height: Math.max(maxY - minY, 4)
  };
}
