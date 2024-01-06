import { Point } from '../primitives/point.ts';

export declare namespace IViewport {
  interface IDragProps {
    start: Point;
    end: Point;
    offset: Point;
    active: boolean;
  }
}

export class Viewport {
  public readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  public zoom: number;
  public offset: Point;
  public center: Point;
  private drag: IViewport.IDragProps;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d')!;

    this.zoom = 1;
    this.center = new Point(this.canvas.width / 2, this.canvas.height / 2);
    this.offset = this.scale(this.center, -1);

    this.drag = {
      start: new Point(0, 0),
      end: new Point(0, 0),
      offset: new Point(0, 0),
      active: false,
    };

    this.addEventListeners();
  }

  public getOffset(): Point {
    return this.add(this.offset, this.drag.offset);
  }

  public getMouse(event: MouseEvent, subtractDragOffset: boolean = false): Point {
    const point = new Point(
      (event.offsetX - this.center.x) * this.zoom - this.offset.x,
      (event.offsetY - this.center.y) * this.zoom - this.offset.y,
    );

    return subtractDragOffset ? this.subtract(point, this.drag.offset) : point;
  }

  public reset() {
    this.context.restore();
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.save();
    this.context.translate(this.center.x, this.center.y);
    this.context.scale(1 / this.zoom, 1 / this.zoom);
    const offset = this.getOffset();
    this.context.translate(offset.x, offset.y);
  }

  private addEventListeners(): void {
    this.canvas.addEventListener('wheel', this.handleMouseWheel.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleMouseWheel(event: WheelEvent): void {
    const direction = Math.sign(event.deltaY);
    const step = 0.1;

    this.zoom += direction * step;
    this.zoom = Math.max(1, Math.min(5, this.zoom));
  }

  private handleMouseDown(event: MouseEvent): void {
    // Middle button
    if (event.button === 1) {
      this.drag.start = this.getMouse(event);
      this.drag.active = true;
    }
  }

  private handleMouseUp(): void {
    if (this.drag.active) {
      this.offset = this.add(this.offset, this.drag.offset);

      this.drag = {
        start: new Point(0, 0),
        end: new Point(0, 0),
        offset: new Point(0, 0),
        active: false,
      };
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.drag.active) {
      this.drag.end = this.getMouse(event);
      this.drag.offset = this.subtract(this.drag.end, this.drag.start);
    }
  }

  private add(pointOne: Point, pointTwo: Point): Point {
    return new Point(pointOne.x + pointTwo.x, pointOne.y + pointTwo.y);
  }

  private subtract(pointOne: Point, pointTwo: Point): Point {
    return new Point(pointOne.x - pointTwo.x, pointOne.y - pointTwo.y);
  }

  private scale(point: Point, scaler: number): Point {
    return new Point(point.x * scaler, point.y * scaler);
  }
}
