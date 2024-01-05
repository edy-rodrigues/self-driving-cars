export class Point {
  public readonly x: number;
  public readonly y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public draw(context: CanvasRenderingContext2D, size: number = 18, color: string = "black"): void {
    const radius: number = size / 2;

    context.beginPath();
    context.fillStyle = color;
    context.arc(this.x, this.y, radius, 0, Math.PI * 2);
    context.fill();
  }

  public equals(point: Point) {
    return this.x === point.x && this.y === point.y;
  }
}