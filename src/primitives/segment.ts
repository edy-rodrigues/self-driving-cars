import type { Point } from './point.ts';

export class Segment {
  public p1: Point;
  public p2: Point;

  public constructor(p1: Point, p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  public draw(context: CanvasRenderingContext2D, width: number = 2, color: string = 'black'): void {
    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = color;
    context.moveTo(this.p1.x, this.p1.y);
    context.lineTo(this.p2.x, this.p2.y);
    context.stroke();
  }

  public equals(segment: Segment): boolean {
    return this.includes(segment.p1) && this.includes(segment.p2);
  }

  public includes(point: Point): boolean {
    return this.p1.equals(point) || this.p2.equals(point);
  }
}
