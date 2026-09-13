import { Layer, SvgDocument } from '../types/layer';

/**
 * Converts SVG shape primitives to standard SVG path "d" strings.
 */
export function rectToPath(
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  rx = 0,
  ry = 0
): string {
  if (width <= 0 || height <= 0) return '';
  rx = Math.max(0, Math.min(rx || ry, width / 2));
  ry = Math.max(0, Math.min(ry || rx, height / 2));

  if (rx === 0 && ry === 0) {
    return `M ${x} ${y} h ${width} v ${height} h ${-width} Z`;
  }

  return (
    `M ${x + rx} ${y} ` +
    `h ${width - 2 * rx} ` +
    `a ${rx} ${ry} 0 0 1 ${rx} ${ry} ` +
    `v ${height - 2 * ry} ` +
    `a ${rx} ${ry} 0 0 1 ${-rx} ${ry} ` +
    `h ${-(width - 2 * rx)} ` +
    `a ${rx} ${ry} 0 0 1 ${-rx} ${-ry} ` +
    `v ${-(height - 2 * ry)} ` +
    `a ${rx} ${ry} 0 0 1 ${rx} ${-ry} Z`
  );
}

export function circleToPath(cx = 0, cy = 0, r = 0): string {
  if (r <= 0) return '';
  return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
}

export function ellipseToPath(cx = 0, cy = 0, rx = 0, ry = 0): string {
  if (rx <= 0 || ry <= 0) return '';
  return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
}

export function lineToPath(x1 = 0, y1 = 0, x2 = 0, y2 = 0): string {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

export function pointsToPath(pointsStr: string, closed: boolean): string {
  const nums = pointsStr
    .trim()
    .split(/[\s,]+/)
    .map(Number)
    .filter(n => !isNaN(n));
  if (nums.length < 2) return '';

  let d = `M ${nums[0]} ${nums[1]}`;
  for (let i = 2; i < nums.length; i += 2) {
    d += ` L ${nums[i]} ${nums[i + 1]}`;
  }
  if (closed) {
    d += ' Z';
  }
  return d;
}

export interface ParsedStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  transform?: string;
}

function parseStyleString(styleStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!styleStr) return result;
  const decls = styleStr.split(';');
  for (const decl of decls) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx > 0) {
      const key = decl.slice(0, colonIdx).trim().toLowerCase();
      const val = decl.slice(colonIdx + 1).replace(/\s*!important/i, '').trim();
      if (key && val) {
        result[key] = val;
      }
    }
  }
  return result;
}

function getAttrValue(attrsStr: string, name: string): string | null {
  // Matches "value", 'value', or unquoted value
  const pattern = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const m = attrsStr.match(pattern);
  if (!m) return null;
  return m[1] !== undefined ? m[1] : m[2] !== undefined ? m[2] : m[3];
}

export function parseCssRules(svgText: string): Map<string, Record<string, string>> {
  const rules = new Map<string, Record<string, string>>();
  const styleTagRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch: RegExpExecArray | null;

  while ((styleMatch = styleTagRegex.exec(svgText)) !== null) {
    // Strip comments and CDATA tags commonly emitted by Illustrator/Inkscape
    const cssContent = styleMatch[1]
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/<!\[CDATA\[|\]\]>/g, '');
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let ruleMatch: RegExpExecArray | null;

    while ((ruleMatch = ruleRegex.exec(cssContent)) !== null) {
      const selectors = ruleMatch[1].split(',').map(s => s.trim());
      const decls = parseStyleString(ruleMatch[2]);
      for (const sel of selectors) {
        if (!sel) continue;
        if (!rules.has(sel)) {
          rules.set(sel, {});
        }
        Object.assign(rules.get(sel)!, decls);
      }
    }
  }
  return rules;
}

function extractStylesFromAttrs(
  attrsStr: string,
  tag: string,
  cssRules: Map<string, Record<string, string>>,
  parentStyles?: ParsedStyle
): ParsedStyle {
  const styleVal = getAttrValue(attrsStr, 'style') || '';
  const inlineStyles = parseStyleString(styleVal);
  const classVal = getAttrValue(attrsStr, 'class') || '';
  const idVal = getAttrValue(attrsStr, 'id') || '';

  let classStyles: Record<string, string> = {};
  if (classVal) {
    const classes = classVal.split(/\s+/).filter(Boolean);
    for (const c of classes) {
      // 1. Direct class match: .cls-0
      if (cssRules.has('.' + c)) {
        Object.assign(classStyles, cssRules.get('.' + c));
      }
      // 2. Tag + class match: path.cls-0
      if (cssRules.has(`${tag}.${c}`)) {
        Object.assign(classStyles, cssRules.get(`${tag}.${c}`));
      }
    }
    // 3. Fallback for compound or descendant selectors: svg .cls-0
    for (const [selector, decls] of cssRules.entries()) {
      for (const c of classes) {
        if (selector.includes('.' + c) && !selector.includes('#') && !classStyles['fill'] && decls['fill']) {
          Object.assign(classStyles, decls);
        }
      }
    }
  }

  let idStyles: Record<string, string> = {};
  if (idVal && cssRules.has('#' + idVal)) {
    idStyles = cssRules.get('#' + idVal) || {};
  }

  let tagStyles = cssRules.get(tag) || {};

  // Precedence: inline style > attribute > ID CSS > Class CSS > Tag CSS > Parent style
  const fill =
    inlineStyles['fill'] ??
    getAttrValue(attrsStr, 'fill') ??
    idStyles['fill'] ??
    classStyles['fill'] ??
    tagStyles['fill'] ??
    parentStyles?.fill;

  const stroke =
    inlineStyles['stroke'] ??
    getAttrValue(attrsStr, 'stroke') ??
    idStyles['stroke'] ??
    classStyles['stroke'] ??
    tagStyles['stroke'] ??
    parentStyles?.stroke;

  const strokeWidthStr =
    inlineStyles['stroke-width'] ??
    getAttrValue(attrsStr, 'stroke-width') ??
    idStyles['stroke-width'] ??
    classStyles['stroke-width'] ??
    tagStyles['stroke-width'] ??
    parentStyles?.strokeWidth?.toString();

  const opacityStr =
    inlineStyles['opacity'] ??
    getAttrValue(attrsStr, 'opacity') ??
    idStyles['opacity'] ??
    classStyles['opacity'] ??
    tagStyles['opacity'] ??
    parentStyles?.opacity?.toString();

  const transform = getAttrValue(attrsStr, 'transform') ?? inlineStyles['transform'] ?? parentStyles?.transform;

  const strokeWidth = strokeWidthStr ? parseFloat(strokeWidthStr) : undefined;
  const opacity = opacityStr ? parseFloat(opacityStr) : undefined;

  let finalFill = fill;
  const isContainer = tag === 'g' || tag === 'svg' || tag === 'defs' || tag === 'clipPath';
  // If element is a path or concrete shape and has no fill and no stroke at all,
  // SVG standard defaults fill to black (#000000). Container elements must not default to black.
  if (!finalFill && !stroke && !isContainer) {
    finalFill = '#000000';
  }

  return {
    fill: finalFill || undefined,
    stroke: stroke || undefined,
    strokeWidth: strokeWidth !== undefined && !isNaN(strokeWidth) ? strokeWidth : undefined,
    opacity: opacity !== undefined && !isNaN(opacity) ? opacity : undefined,
    transform: transform || undefined
  };
}

let layerCounter = 1;

interface RawElement {
  tag: string;
  attrsStr: string;
  innerContent: string;
}

function parseTopLevelElements(xml: string): RawElement[] {
  const elements: RawElement[] = [];
  let i = 0;
  while (i < xml.length) {
    const tagStart = xml.indexOf('<', i);
    if (tagStart === -1) break;

    // Skip XML comments <!-- ... -->
    if (xml.startsWith('<!--', tagStart)) {
      const commentEnd = xml.indexOf('-->', tagStart);
      i = commentEnd === -1 ? xml.length : commentEnd + 3;
      continue;
    }

    // Skip doctype or xml declaration <? ... ?> or <!DOCTYPE ...>
    if (xml.startsWith('<?', tagStart) || xml.startsWith('<!', tagStart)) {
      const declEnd = xml.indexOf('>', tagStart);
      i = declEnd === -1 ? xml.length : declEnd + 1;
      continue;
    }

    const tagEnd = xml.indexOf('>', tagStart);
    if (tagEnd === -1) break;

    const openTagContent = xml.slice(tagStart + 1, tagEnd).trim();
    const isSelfClosing = openTagContent.endsWith('/');
    const cleanContent = isSelfClosing ? openTagContent.slice(0, -1).trim() : openTagContent;
    const firstSpace = cleanContent.search(/\s/);
    const tagName = (firstSpace === -1 ? cleanContent : cleanContent.slice(0, firstSpace)).toLowerCase();
    const attrsStr = firstSpace === -1 ? '' : cleanContent.slice(firstSpace).trim();

    if (isSelfClosing) {
      elements.push({ tag: tagName, attrsStr, innerContent: '' });
      i = tagEnd + 1;
    } else {
      // Find matching closing tag
      let depth = 1;
      let cur = tagEnd + 1;
      const openPattern = new RegExp(`<${tagName}\\b[^>]*(\\/?>|>)`, 'gi');
      const closePattern = new RegExp(`</${tagName}>`, 'gi');
      let closeIdx = -1;

      while (cur < xml.length) {
        openPattern.lastIndex = cur;
        closePattern.lastIndex = cur;
        const nextOpen = openPattern.exec(xml);
        const nextClose = closePattern.exec(xml);

        if (!nextClose) break;

        if (nextOpen && nextOpen.index < nextClose.index) {
          if (!nextOpen[1].endsWith('/>')) {
            depth++;
          }
          cur = nextOpen.index + nextOpen[0].length;
        } else {
          depth--;
          if (depth === 0) {
            closeIdx = nextClose.index;
            cur = nextClose.index + nextClose[0].length;
            break;
          }
          cur = nextClose.index + nextClose[0].length;
        }
      }

      if (closeIdx !== -1) {
        const innerContent = xml.slice(tagEnd + 1, closeIdx);
        elements.push({ tag: tagName, attrsStr, innerContent });
        i = cur;
      } else {
        i = tagEnd + 1;
      }
    }
  }
  return elements;
}

function processRawElements(
  rawElements: RawElement[],
  cssRules: Map<string, Record<string, string>>,
  parentStyles?: ParsedStyle
): Layer[] {
  const layers: Layer[] = [];

  for (const el of rawElements) {
    const { tag, attrsStr, innerContent } = el;
    if (tag === 'defs' || tag === 'style' || tag === 'script' || tag === 'metadata') {
      continue;
    }

    const id = getAttrValue(attrsStr, 'id') || `layer_${layerCounter++}`;
    const name = getAttrValue(attrsStr, 'data-name') || getAttrValue(attrsStr, 'id') || `${tag} ${layers.length + 1}`;
    const styles = extractStylesFromAttrs(attrsStr, tag, cssRules, parentStyles);

    if (tag === 'path') {
      const d = getAttrValue(attrsStr, 'd') || '';
      if (d.trim()) {
        layers.push({
          id,
          name,
          type: 'path',
          d: d.trim(),
          ...styles,
          visible: true,
          locked: false
        });
      }
    } else if (tag === 'rect') {
      const x = parseFloat(getAttrValue(attrsStr, 'x') || '0');
      const y = parseFloat(getAttrValue(attrsStr, 'y') || '0');
      const width = parseFloat(getAttrValue(attrsStr, 'width') || '0');
      const height = parseFloat(getAttrValue(attrsStr, 'height') || '0');
      const rx = parseFloat(getAttrValue(attrsStr, 'rx') || '0');
      const ry = parseFloat(getAttrValue(attrsStr, 'ry') || '0');
      const d = rectToPath(x, y, width, height, rx, ry);
      if (d) {
        layers.push({
          id,
          name,
          type: 'rect',
          d,
          ...styles,
          visible: true,
          locked: false
        });
      }
    } else if (tag === 'circle') {
      const cx = parseFloat(getAttrValue(attrsStr, 'cx') || '0');
      const cy = parseFloat(getAttrValue(attrsStr, 'cy') || '0');
      const r = parseFloat(getAttrValue(attrsStr, 'r') || '0');
      const d = circleToPath(cx, cy, r);
      if (d) {
        layers.push({
          id,
          name,
          type: 'circle',
          d,
          ...styles,
          visible: true,
          locked: false
        });
      }
    } else if (tag === 'ellipse') {
      const cx = parseFloat(getAttrValue(attrsStr, 'cx') || '0');
      const cy = parseFloat(getAttrValue(attrsStr, 'cy') || '0');
      const rx = parseFloat(getAttrValue(attrsStr, 'rx') || '0');
      const ry = parseFloat(getAttrValue(attrsStr, 'ry') || '0');
      const d = ellipseToPath(cx, cy, rx, ry);
      if (d) {
        layers.push({
          id,
          name,
          type: 'ellipse',
          d,
          ...styles,
          visible: true,
          locked: false
        });
      }
    } else if (tag === 'line') {
      const x1 = parseFloat(getAttrValue(attrsStr, 'x1') || '0');
      const y1 = parseFloat(getAttrValue(attrsStr, 'y1') || '0');
      const x2 = parseFloat(getAttrValue(attrsStr, 'x2') || '0');
      const y2 = parseFloat(getAttrValue(attrsStr, 'y2') || '0');
      const d = lineToPath(x1, y1, x2, y2);
      layers.push({
        id,
        name,
        type: 'line',
        d,
        ...styles,
        visible: true,
        locked: false
      });
    } else if (tag === 'polyline' || tag === 'polygon') {
      const points = getAttrValue(attrsStr, 'points') || '';
      const d = pointsToPath(points, tag === 'polygon');
      if (d) {
        layers.push({
          id,
          name,
          type: tag as 'polyline' | 'polygon',
          d,
          ...styles,
          visible: true,
          locked: false
        });
      }
    } else if (tag === 'g') {
      const childRaw = parseTopLevelElements(innerContent);
      // Group passes its resolved styles (fill, stroke, opacity) down to children
      const groupChildren = processRawElements(childRaw, cssRules, styles);
      if (groupChildren.length > 0) {
        layers.push({
          id,
          name: name.startsWith('g ') ? `Group ${layers.length + 1}` : name,
          type: 'group',
          d: '',
          ...styles,
          visible: true,
          locked: false,
          children: groupChildren,
          expanded: true
        });
      }
    }
  }

  return layers;
}

/**
 * Universal SVG Parser supporting CSS rules, group inheritance, and viewBox.
 */
export function parseSvg(svgText: string): SvgDocument {
  layerCounter = 1;
  const defaultDoc: SvgDocument = {
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    layers: []
  };

  const trimmed = svgText.trim();
  if (!trimmed) return defaultDoc;

  const cssRules = parseCssRules(trimmed);

  const topLevel = parseTopLevelElements(trimmed);
  const svgEl = topLevel.find(el => el.tag === 'svg');
  if (!svgEl) {
    // Treat raw snippet as layer elements directly
    const layers = processRawElements(topLevel, cssRules);
    return { viewBox: { x: 0, y: 0, width: 100, height: 100 }, layers };
  }

  let viewBox = { x: 0, y: 0, width: 100, height: 100 };
  const vbVal = getAttrValue(svgEl.attrsStr, 'viewBox');
  if (vbVal) {
    const parts = vbVal.split(/[\s,]+/).map(Number);
    if (parts.length >= 4 && !parts.some(isNaN)) {
      viewBox = { x: parts[0], y: parts[1], width: parts[2], height: parts[3] };
    }
  } else {
    const w = parseFloat(getAttrValue(svgEl.attrsStr, 'width') || '100');
    const h = parseFloat(getAttrValue(svgEl.attrsStr, 'height') || '100');
    if (!isNaN(w) && !isNaN(h)) {
      viewBox = { x: 0, y: 0, width: w, height: h };
    }
  }

  // Extract root <svg> styles as base parent styles
  const rootStyles = extractStylesFromAttrs(svgEl.attrsStr, 'svg', cssRules);
  const childElements = parseTopLevelElements(svgEl.innerContent);
  const layers = processRawElements(childElements, cssRules, rootStyles);
  return { viewBox, layers };
}
