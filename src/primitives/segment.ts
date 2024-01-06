import type { Point } from './point.ts';

export declare namespace ISegment {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
    width?: number;
    color?: string;
    dash?: number[];
  }
}

export class Segment {
  public p1: Point;
  public p2: Point;

  public constructor(p1: Point, p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  public draw(params: ISegment.IDrawParams): void {
    const { context, dash = [], width = 2, color = 'black' } = params;

    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = color;
    context.setLineDash(dash);
    context.moveTo(this.p1.x, this.p1.y);
    context.lineTo(this.p2.x, this.p2.y);
    context.stroke();
    context.setLineDash([]);
  }

  public equals(segment: Segment): boolean {
    return this.includes(segment.p1) && this.includes(segment.p2);
  }

  public includes(point: Point): boolean {
    return this.p1.equals(point) || this.p2.equals(point);
  }
}
