export declare namespace IPoint {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
    size?: number;
    color?: string;
    outline?: boolean;
    fill?: boolean;
  }
}

export class Point {
  public x: number;
  public y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public draw(params: IPoint.IDrawParams): void {
    const { context, size = 18, outline = false, fill = false, color = 'black' } = params;

    const radius: number = size / 2;

    context.beginPath();
    context.fillStyle = color;
    context.arc(this.x, this.y, radius, 0, Math.PI * 2);
    context.fill();

    if (outline) {
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = 'white';
      context.arc(this.x, this.y, radius * 0.6, 0, Math.PI * 2);
      context.stroke();
    }

    if (fill) {
      context.beginPath();
      context.arc(this.x, this.y, radius * 0.4, 0, Math.PI * 2);
      context.fillStyle = 'white';
      context.fill();
    }
  }

  public equals(point: Point) {
    return this.x === point.x && this.y === point.y;
  }
}
