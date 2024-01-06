import cardPNG from '../assets/images/car.png';
import { Utils } from '../engine/utils.ts';
import type { Point } from '../primitives/point.ts';
import { Marking } from './marking.ts';

export declare namespace IStart {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }
}

export class Start extends Marking {
  private readonly image: HTMLImageElement;

  public constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, height);

    this.type = 'start';
    this.image = new Image();
    this.image.src = cardPNG;
  }

  public draw(params: IStart.IDrawParams): void {
    const { context } = params;

    context.save();
    context.translate(this.center.x, this.center.y);
    context.rotate(Utils.angle(this.directionVector) - Math.PI / 2);

    context.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);

    context.restore();
  }
}
