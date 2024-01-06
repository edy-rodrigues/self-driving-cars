import { Utils } from '../engine/utils.ts';
import type { Point } from '../primitives/point.ts';
import type { Segment } from '../primitives/segment.ts';
import { Marking } from './marking.ts';

export declare namespace IParking {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }
}

export class Parking extends Marking {
  private readonly borders: Segment[];

  public constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, height);

    this.type = 'parking';
    this.borders = [this.polygon.segments[0], this.polygon.segments[2]];
  }

  public draw(params: IParking.IDrawParams): void {
    const { context } = params;

    for (const border of this.borders) {
      border.draw({ context, width: 5, color: 'white' });
    }

    context.save();
    context.translate(this.center.x, this.center.y);
    context.rotate(Utils.angle(this.directionVector));

    context.beginPath();
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillStyle = 'white';
    context.font = `bold ${this.height * 0.9}px Arial`;
    context.fillText('P', 0, 3);

    context.restore();
  }
}
