import { Utils } from '../engine/utils.ts';
import type { Point } from '../primitives/point.ts';
import type { Segment } from '../primitives/segment.ts';
import { Marking } from './marking.ts';

export declare namespace IStop {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }
}

export class Stop extends Marking {
  private readonly border: Segment;

  public constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, height);

    this.type = 'stop';
    this.border = this.polygon.segments[2];
  }

  public draw(params: IStop.IDrawParams): void {
    const { context } = params;

    this.border.draw({ context, width: 5, color: 'white' });
    context.save();
    context.translate(this.center.x, this.center.y);
    context.rotate(Utils.angle(this.directionVector) - Math.PI / 2);
    context.scale(1, 3);

    context.beginPath();
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillStyle = 'white';
    context.font = `bold ${this.height * 0.3}px Arial`;
    context.fillText('STOP', 0, 1);

    context.restore();
  }
}
