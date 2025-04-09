import { Utils } from '../engine/utils.ts';
import type { IWorld } from '../engine/world.ts';
import { Envelope } from '../primitives/envelope.ts';
import type { Point } from '../primitives/point.ts';
import type { Polygon } from '../primitives/polygon.ts';
import { Segment } from '../primitives/segment.ts';

export declare namespace IMarking {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }
}

export class Marking {
  public type: IWorld.TTypeMarking;
  public readonly center: Point;
  public readonly directionVector: Point;
  public readonly width: number;
  public readonly height: number;
  public readonly support: Segment;
  public readonly polygon: Polygon;

  public constructor(center: Point, directionVector: Point, width: number, height: number) {
    this.center = center;
    this.directionVector = directionVector;
    this.width = width;
    this.height = height;

    this.type = 'marking';
    this.support = new Segment(
      Utils.translate(center, Utils.angle(directionVector), height / 2),
      Utils.translate(center, Utils.angle(directionVector), -height / 2),
    );
    this.polygon = new Envelope(this.support, width, 0).poly;
  }

  public draw(params: IMarking.IDrawParams): void {
    const { context } = params;

    this.polygon.draw({ context });
  }
}
