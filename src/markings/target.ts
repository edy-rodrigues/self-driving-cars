import type { Point } from '../primitives/point.ts';
import { Marking } from './marking.ts';

export declare namespace ITarget {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }
}

export class Target extends Marking {
  public constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, height);

    this.type = 'target';
  }

  public draw(params: ITarget.IDrawParams): void {
    const { context } = params;

    this.center.draw({ context, color: 'red', size: 30 });
    this.center.draw({ context, color: 'white', size: 20 });
    this.center.draw({ context, color: 'red', size: 10 });
  }
}
