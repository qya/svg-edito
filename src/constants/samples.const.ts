import { Layer } from '../types/layer';

export interface SvgSampleItem {
  id: string;
  title: string;
  description: string;
  category: 'Icons' | 'Shapes' | 'Art' | 'Logos';
  d: string;
  viewBox: { x: number; y: number; width: number; height: number };
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  layers?: Layer[];
}

export const SAMPLE_SVGS: SvgSampleItem[] = [
  {
    id: 'feather-logo',
    title: 'Our Logo',
    description: 'The official multi-layer dual svgedito vector logo.',
    category: 'Logos',
    d: 'm78.5 8c-4.9-3.6-10.4-6.4-18.5-6.4-3.6 0-8.9 0.7-13.2 2.5s-12.2 6.1-15.8 8-5.1 3.2-6.6 4.2c-1.4 1.1-3.4 2.7-5.9 5.3-1.5 1.8-3.1 3.8-4.1 5.6-1.2 2.2-2.4 5.2-2.4 5.7-0.7 2.5-1.4 5.5-1.4 9.1 0 2.9 0.6 7.9 3.3 12.4 3.5 5.2 7.1 7.5 10.2 9l9.9 5 5.9 3c1.7 1 3.2 1.7 6 1.7 1.8-0.1 3-0.7 4.1-1.2l6.9-2.9 7.3-4c4.9-2.1 3.7-6.9 0.8-9.2-1.4-1.1-4.3-3-6.8-2.3l-2.2 1-2.4 1.2c-1.7 0.8-3.6 1.4-5.8 1.4-3.3 0-5.2-0.9-6.8-1.6l-3.8-1.8c-5.1-2.5-7.6-3.3-10.5-7-0.5-0.8-1.1-1.8-1.4-2.7-0.9-3-0.7-6 0.9-9.4 1.9-3.1 3.6-4.5 7.3-6.6 1.4-0.5 3.1-1.4 4.5-2.1 1.1-0.5 2.5-1.2 3.6-1.8 1.3-0.6 2.8-1.3 4-2 1.8-0.9 3.3-1.7 5.3-2.7 2.1-1 4.5-1.6 7-1.6 2.7 0 4.7 0.6 7.5 2.1l5.2 3.2 6.4 4.1 3.4 2.3c0.9 0.6 1.1 0.5 2-0.6l1.5-1.5 1.6-1.9c0.6-0.5 1.2-1.5 2-2.3 1-1 2.1-3.3 0.4-5.6-1.8-2.5-4.9-6.1-9.4-9.6z',
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    fill: '#1671F8',
    layers: [
      {
        id: 'layer_logo_1',
        name: 'SVG Edito 1',
        type: 'path',
        d: 'm78.5 8c-4.9-3.6-10.4-6.4-18.5-6.4-3.6 0-8.9 0.7-13.2 2.5s-12.2 6.1-15.8 8-5.1 3.2-6.6 4.2c-1.4 1.1-3.4 2.7-5.9 5.3-1.5 1.8-3.1 3.8-4.1 5.6-1.2 2.2-2.4 5.2-2.4 5.7-0.7 2.5-1.4 5.5-1.4 9.1 0 2.9 0.6 7.9 3.3 12.4 3.5 5.2 7.1 7.5 10.2 9l9.9 5 5.9 3c1.7 1 3.2 1.7 6 1.7 1.8-0.1 3-0.7 4.1-1.2l6.9-2.9 7.3-4c4.9-2.1 3.7-6.9 0.8-9.2-1.4-1.1-4.3-3-6.8-2.3l-2.2 1-2.4 1.2c-1.7 0.8-3.6 1.4-5.8 1.4-3.3 0-5.2-0.9-6.8-1.6l-3.8-1.8c-5.1-2.5-7.6-3.3-10.5-7-0.5-0.8-1.1-1.8-1.4-2.7-0.9-3-0.7-6 0.9-9.4 1.9-3.1 3.6-4.5 7.3-6.6 1.4-0.5 3.1-1.4 4.5-2.1 1.1-0.5 2.5-1.2 3.6-1.8 1.3-0.6 2.8-1.3 4-2 1.8-0.9 3.3-1.7 5.3-2.7 2.1-1 4.5-1.6 7-1.6 2.7 0 4.7 0.6 7.5 2.1l5.2 3.2 6.4 4.1 3.4 2.3c0.9 0.6 1.1 0.5 2-0.6l1.5-1.5 1.6-1.9c0.6-0.5 1.2-1.5 2-2.3 1-1 2.1-3.3 0.4-5.6-1.8-2.5-4.9-6.1-9.4-9.6z',
        fill: '#1671F8',
        stroke: 'none',
        visible: true,
        locked: false
      },
      {
        id: 'layer_logo_2',
        name: 'SVG Edito 2',
        type: 'path',
        d: 'm86.2 44.9c-1.6-2.5-4.6-5.9-7.8-8-3.5-2.2-10.7-6.2-14.5-8.4-1.7-0.8-3.4-1-4.9-1-1.3 0-2.8 0.5-3 0.6l-3.8 1.7-1.2 0.6-3.8 1.6-2.7 1.4-3.6 1.7c-2.5 1.3-4.9 1.9-5.9 3.6-0.6 1.2-0.8 3.4 1.7 4.8 1.9 0.9 2.3 1.1 9.4 4.6 0.5 0.3 0.9 0 1.3-0.2l5.6-2.9c1.6-0.8 4-1.4 5.9-1.4 1.5 0 2.6 0.1 4.3 0.6 3.3 1 5.9 2.4 8.3 4.5h0.1l2 2 0.6 0.8c0.8 1 1.9 2.9 2.2 4 0.7 1.9 1 3.5 0.9 6.1-0.2 2.4-1.1 5.3-2.8 7.4-0.6 1-1.5 1.6-2.3 3.1-1 0.5-3.5 1.9-4.2 2.1l-6.1 2.5-3.9 1.5c-1.5 0.8-4.5 1.8-5.4 2.3-2.4 0.9-5 1.5-7.6 1.4-4.5 0-7-1.4-10.6-3.4l-15.3-9.4c-0.7-0.5-1.2-0.4-2 0.4l-5.1 4.4-1.8 1.6c-1.2 1.1-1.7 2-1.6 3.5 0 1.9 1.9 3.6 3.4 5.4 2.2 2.3 4.5 4.6 7.6 6.8 4.6 3.2 11.6 7.2 22 7.2 4.3 0 8.4-0.5 14-2.3 3.9-1.4 12-4.4 18-7.2 4.4-2.3 7.8-4.5 10.6-7.9s6.2-9 7.1-17.1c0.4-6.3-1.1-13.7-5.1-19z',
        fill: '#1671F8',
        stroke: 'none',
        visible: true,
        locked: false
      },
      {
        id: 'layer_logo_3',
        name: 'SVG Edito 3',
        type: 'path',
        d: 'm78.5 8.1-13.1 11.6 5.1 3.4 9.9 6.4c0.6 0.5 1.1 0.6 1.8-0.4l2.3-2.2 3.6-4.2c0.8-1.6 1.3-3.1-0.5-5.3-2.1-2.9-6-7.2-9.1-9.3zm-58.9 83.1 14.7-12.8-15.2-9.3c-0.7-0.5-1.2-0.5-2 0.4l-7.1 6.1c-1.1 1-1.5 1.9-1.4 3.4-0.1 1.7 1.9 3.6 3.4 5.2 2 2.3 4.9 5 7.6 7z',
        fill: '#4490FC',
        stroke: 'none',
        visible: true,
        locked: false
      }
    ]
  },
  {
    id: 'heart-icon',
    title: 'Heart',
    description: 'Smooth Bézier curve heart shape with cubic curves.',
    category: 'Icons',
    d: 'M 50 88 C 20 68 6 48 6 30 C 6 14 18 4 34 4 C 42 4 47 8 50 12 C 53 8 58 4 66 4 C 82 4 94 14 94 30 C 94 48 80 68 50 88 Z',
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    fill: '#ff4d6d'
  },
  {
    id: 'star-5point',
    title: 'Golden Star',
    description: 'Classic 5-point geometric star polygon.',
    category: 'Shapes',
    d: 'M 50 5 L 63 35 L 96 38 L 71 60 L 78 93 L 50 76 L 22 93 L 29 60 L 4 38 L 37 35 Z',
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    fill: '#ffd166',
    stroke: '#ffb703',
    strokeWidth: 2
  },
  {
    id: 'coffee-cup',
    title: 'Coffee Cup',
    description: 'Stylized hot coffee cup with steam trails.',
    category: 'Art',
    d: 'M 20 30 L 25 75 C 26 84 34 90 44 90 L 56 90 C 66 90 74 84 75 75 L 80 30 Z M 80 40 L 86 40 C 92 40 96 45 96 52 C 96 59 92 64 86 64 L 79 64 M 35 12 C 32 17 38 21 35 26 M 50 10 C 47 16 53 20 50 26 M 65 12 C 62 17 68 21 65 26',
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    fill: 'none',
    stroke: '#06d6a0',
    strokeWidth: 4
  },
  {
    id: 'rocket-ship',
    title: 'Space Rocket',
    description: 'Vector rocket ship blasting off with flame booster.',
    category: 'Art',
    d: 'M 50 10 C 60 25 68 45 68 65 L 60 68 L 62 82 L 50 75 L 38 82 L 40 68 L 32 65 C 32 45 40 25 50 10 Z M 32 50 L 18 64 L 28 68 M 68 50 L 82 64 L 72 68 M 50 32 A 6 6 0 1 0 50 44 A 6 6 0 1 0 50 32',
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    fill: '#4cc9f0',
    stroke: '#ffffff',
    strokeWidth: 2
  },
  {
    id: 'cloud-weather',
    title: 'Cloud',
    description: 'Weather cloud symbol with smooth arc lobes.',
    category: 'Icons',
    d: 'M 25 70 A 18 18 0 0 1 32 36 A 24 24 0 0 1 72 32 A 20 20 0 0 1 85 70 Z',
    viewBox: { x: 0, y: 0, width: 100, height: 100 },
    fill: '#e0fbfc',
    stroke: '#48cae4',
    strokeWidth: 3
  }
];
