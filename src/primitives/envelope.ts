import { Utils } from '../engine/utils.ts';
import type { Point } from './point.ts';
import { Polygon } from './polygon.ts';
import type { Segment } from './segment.ts';

export declare namespace IEnvelop {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
    fill?: string;
    stroke?: string;
  }
}

export class Envelope {
  private readonly skeleton: Segment;
  public polygon: Polygon;

  public constructor(skeleton: Segment, width: number, roundness: number = 1) {
    this.skeleton = skeleton;
    this.polygon = this.generatePolygon(width, roundness);
  }

  public draw(params: IEnvelop.IDrawParams): void {
    const { context, stroke, fill } = params;

    this.polygon.draw({
      context,
      stroke,
      fill,
    });
  }

  private generatePolygon(width: number, roundness: number): Polygon {
    const { p1, p2 } = this.skeleton;

    const radius = width / 2;
    const alpha = Utils.angle(Utils.subtract(p1, p2));
    const alphaCW = alpha + Math.PI / 2;
    const alphaCCW = alpha - Math.PI / 2;

    const step = Math.PI / Math.max(1, roundness);
    const eps = step / 2;

    const points: Point[] = [];

    for (let i = alphaCCW; i <= alphaCW + eps; i += step) {
      points.push(Utils.translate(p1, i, radius));
    }

    for (let i = alphaCCW; i <= alphaCW + eps; i += step) {
      points.push(Utils.translate(p2, Math.PI + i, radius));
    }

    return new Polygon(points);
  }
}
