import { Utils } from '../engine/utils.ts';

export declare namespace IRoad {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }
}

export class Road {
  private readonly x: number;
  private readonly width: number;
  private readonly laneCount: number;
  private readonly left: number;
  private readonly right: number;
  private readonly infinity: number;
  private readonly top: number;
  private readonly bottom: number;
  private readonly borders: { x: number; y: number }[][];

  public constructor(x: number, width: number, laneCount: number = 3) {
    this.x = x;
    this.width = width;
    this.laneCount = laneCount;

    this.left = this.x - this.width / 2;
    this.right = this.x + this.width / 2;

    this.infinity = 1000000;
    this.top = -this.infinity;
    this.bottom = this.infinity;

    const topRight = { x: this.right, y: this.top };
    const topLeft = { x: this.left, y: this.top };
    const bottomRight = { x: this.right, y: this.bottom };
    const bottomLeft = { x: this.left, y: this.bottom };

    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight],
    ];
  }

  public getLaneCenter(laneIndex: number): number {
    const laneWidth = this.width / this.laneCount;
    return this.left + laneWidth / 2 + laneIndex * laneWidth;
  }

  public draw(params: IRoad.IDrawParams): void {
    const { context } = params;

    context.lineWidth = 5;
    context.strokeStyle = 'white';

    for (let i = 1; i <= this.laneCount - 1; i++) {
      const x = Utils.lerp(this.left, this.right, i / this.laneCount);

      context.setLineDash([20, 20]);
      context.beginPath();
      context.moveTo(x, this.top);
      context.lineTo(x, this.bottom);
      context.stroke();
    }

    context.setLineDash([]);

    for (const border of this.borders) {
      context.beginPath();
      context.moveTo(border[0].x, border[0].y);
      context.lineTo(border[1].x, border[1].y);
      context.stroke();
    }
  }
}
