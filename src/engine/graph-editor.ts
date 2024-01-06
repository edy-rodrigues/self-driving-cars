import type { Graph } from '../math/graph.ts';
import type { Point } from '../primitives/point.ts';
import { Segment } from '../primitives/segment.ts';
import type { Viewport } from './viewport.ts';

export class GraphEditor {
  private readonly viewport: Viewport;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly graph: Graph;
  private mousePoint: Point | null;
  private selectedPoint: Point | null;
  private hoveredPoint: Point | null;
  private draggingPoint: boolean;

  public constructor(viewport: Viewport, graph: Graph) {
    this.viewport = viewport;
    this.canvas = this.viewport.canvas;
    this.context = this.canvas.getContext('2d')!;
    this.graph = graph;

    this.mousePoint = null;
    this.selectedPoint = null;
    this.hoveredPoint = null;
    this.draggingPoint = false;

    this.addEventListeners();
  }

  public display() {
    this.graph.draw(this.context);

    if (this.hoveredPoint) {
      this.hoveredPoint.draw({
        context: this.context,
        fill: true,
      });
    }

    if (this.selectedPoint) {
      const intent = this.hoveredPoint ? this.hoveredPoint : this.mousePoint;
      new Segment(this.selectedPoint, intent!).draw({
        context: this.context,
        dash: [3, 3],
      });
      this.selectedPoint.draw({
        context: this.context,
        outline: true,
      });
    }
  }

  public dispose() {
    this.graph.dispose();
    this.selectedPoint = null;
    this.hoveredPoint = null;
  }

  private selectPoint(point: Point): void {
    if (this.selectedPoint) {
      this.graph.tryAddSegment(new Segment(this.selectedPoint, point));
    }

    this.selectedPoint = point;
  }

  private removePoint(point: Point): void {
    this.graph.removePoint(point);
    this.hoveredPoint = null;

    if (this.selectedPoint === point) {
      this.selectedPoint = null;
    }
  }

  private addEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));

    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

    this.canvas.addEventListener('mouseup', (): void => {
      this.draggingPoint = false;
    });

    this.canvas.addEventListener('contextmenu', (event: Event): void => event.preventDefault());
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 2) {
      // Right click
      if (this.selectedPoint) {
        this.selectedPoint = null;
      } else if (this.hoveredPoint) {
        this.removePoint(this.hoveredPoint);
      }
    }

    if (event.button === 0) {
      // Left click
      if (this.hoveredPoint) {
        this.selectPoint(this.hoveredPoint);
        this.draggingPoint = true;
        return;
      }

      this.graph.addPoint(this.mousePoint!);

      this.selectPoint(this.mousePoint!);
      this.hoveredPoint = this.mousePoint!;
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    this.mousePoint = this.viewport.getMouse(event, true);

    this.hoveredPoint = this.graph.getNearestPoint({
      point: this.mousePoint,
      threshold: 10 * this.viewport.zoom,
    });

    if (this.draggingPoint) {
      this.selectedPoint!.x = this.mousePoint.x;
      this.selectedPoint!.y = this.mousePoint.y;
    }
  }
}
