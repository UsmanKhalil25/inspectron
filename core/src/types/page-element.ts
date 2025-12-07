export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PageElement {
  id: number;
  tag: string;
  text: string | null;
  boundingBox: BoundingBox;
}
