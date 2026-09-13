import { STORAGE } from '../constants/storage.const';
import { Layer } from '../types/layer';

export interface StoredPath {
  name: string | null;
  path: string;
  layers?: Layer[];
  viewBox?: { x: number; y: number; width: number; height: number };
  docViewBox?: { x: number; y: number; width: number; height: number };
  creationDate: Date;
  changeDate: Date;
}

interface SerializedStoredPath {
  name: string | null;
  path: string;
  layers?: Layer[];
  viewBox?: { x: number; y: number; width: number; height: number };
  docViewBox?: { x: number; y: number; width: number; height: number };
  creationDate: string;
  changeDate: string;
}

export class StorageService {
  storedPaths: StoredPath[] = [];

  constructor() {
    this.load();
  }

  hasPath(name: string): boolean {
    return this.getPath(name) !== undefined;
  }

  getPath(name: string | null = null): StoredPath | undefined {
    return this.storedPaths.find(it => it.name === name);
  }

  removePath(name: string): void {
    this.storedPaths = this.storedPaths.filter(it => it.name !== name);
    this.save();
  }

  addPath(
    name: string | null,
    path: string,
    layers?: Layer[],
    viewBox?: { x: number; y: number; width: number; height: number },
    docViewBox?: { x: number; y: number; width: number; height: number }
  ): void {
    let p = this.getPath(name);
    if (!p) {
      p = {
        name,
        path,
        layers,
        viewBox,
        docViewBox,
        creationDate: new Date(),
        changeDate: new Date()
      };
      this.storedPaths.push(p);
    }
    p.changeDate = new Date();
    p.path = path;
    if (layers !== undefined) {
      p.layers = layers;
    }
    if (viewBox !== undefined) {
      p.viewBox = viewBox;
    }
    if (docViewBox !== undefined) {
      p.docViewBox = docViewBox;
    }
    this.save();
  }

  isEmpty(): boolean {
    return this.storedPaths.filter(it => !!it.name).length === 0;
  }

  load(): void {
    this.storedPaths = [];
    try {
      const stored = localStorage.getItem(STORAGE.STORED_PATHS);
      if (stored) {
        const parsed = JSON.parse(stored) as SerializedStoredPath[];
        this.storedPaths = parsed.map(it => ({
          name: it.name,
          path: it.path,
          layers: it.layers,
          viewBox: it.viewBox,
          docViewBox: it.docViewBox,
          creationDate: new Date(it.creationDate),
          changeDate: new Date(it.changeDate)
        }));
      }
    } catch {
      this.storedPaths = [];
    }
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE.STORED_PATHS, JSON.stringify(this.storedPaths));
    } catch {
      // Ignore quota exceeded or storage disabled
    }
  }
}

export const storageService = new StorageService();
