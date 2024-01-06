import { Utils } from '../engine/utils.ts';
import type { Point } from '../primitives/point.ts';
import { Segment } from '../primitives/segment.ts';
import { Marking } from './marking.ts';

export declare namespace ICrossing {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }
}

export class Crossing extends Marking {
  private readonly borders: Segment[];

  public constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, height);

    this.type = 'crossing';
    this.borders = [this.polygon.segments[0], this.polygon.segments[2]];
  }

  public draw(params: ICrossing.IDrawParams): void {
    const { context } = params;

    const perpendicular = Utils.perpendicular(this.directionVector);

    const line = new Segment(
      Utils.add(this.center, Utils.scale(perpendicular, this.width / 2)),
      Utils.add(this.center, Utils.scale(perpendicular, -this.width / 2)),
    );

    line.draw({ context, width: this.height, color: 'white', dash: [11, 11] });
  }
}
