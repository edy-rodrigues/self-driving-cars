import { Utils } from '../engine/utils.ts';
import { Point } from './point.ts';
import { Polygon } from './polygon.ts';
import { Segment } from './segment.ts';

export declare namespace IEnvelop {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
    fill?: string;
    stroke?: string;
  }
}

export class Envelope {
  public skeleton: Segment;
  public poly: Polygon;

  public constructor(skeleton?: Segment, width?: number, roundness: number = 1) {
    if (!skeleton || !width) {
      this.skeleton = new Segment(new Point(0, 0), new Point(0, 0));
      this.poly = new Polygon([new Point(0, 0)]);
      return;
    }

    this.skeleton = skeleton;
    this.poly = this.generatePolygon(width, roundness);
  }

  public static load(envelope: Envelope): Envelope {
    const newEnvelope = new Envelope();
    newEnvelope.skeleton = new Segment(envelope.skeleton.p1, envelope.skeleton.p2);
    newEnvelope.poly = Polygon.load(envelope.poly);

    return newEnvelope;
  }

  public draw(params: IEnvelop.IDrawParams): void {
    const { context, stroke, fill } = params;

    this.poly.draw({
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
