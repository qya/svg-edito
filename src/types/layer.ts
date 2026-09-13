export type LayerType =
  | 'path'
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'polyline'
  | 'polygon'
  | 'group';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  transform?: string;
  visible: boolean;
  locked: boolean;
  children?: Layer[];
  expanded?: boolean;
}

export interface SvgDocument {
  viewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  layers: Layer[];
}
