import { Utils } from '../engine/utils.ts';
import type { Point } from './point.ts';

export declare namespace ISegment {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
    width?: number;
    color?: string;
    dash?: number[];
    cap?: CanvasLineCap;
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
    const { context, dash = [], width = 2, color = 'black', cap = 'butt' } = params;

    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = color;
    context.lineCap = cap;
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

  public length(): number {
    return Utils.getDistance(this.p1, this.p2);
  }

  public directionVector(): Point {
    return Utils.normalize(Utils.subtract(this.p2, this.p1));
  }

  public distanceToPoint(point: Point): number {
    const project = this.projectPoint(point);

    if (project.offset > 0 && project.offset < 1) {
      return Utils.getDistance(point, project.point);
    }

    const distanceToP1 = Utils.getDistance(point, this.p1);
    const distanceToP2 = Utils.getDistance(point, this.p2);

    return Math.min(distanceToP1, distanceToP2);
  }

  public projectPoint(point: Point) {
    const a = Utils.subtract(point, this.p1);
    const b = Utils.subtract(this.p2, this.p1);
    const normalizeB = Utils.normalize(b);
    const scaler = Utils.dot(a, normalizeB);

    return {
      point: Utils.add(this.p1, Utils.scale(normalizeB, scaler)),
      offset: scaler / Utils.magnitude(b),
    };
  }
}
