import { Utils } from '../engine/utils.ts';
import type { Viewport } from '../engine/viewport.ts';
import type { Graph } from '../math/graph.ts';
import type { Point } from '../primitives/point.ts';
import { Segment } from '../primitives/segment.ts';

export class GraphEditor {
  private readonly viewport: Viewport;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly graph: Graph;

  private mousePoint: Point | null;
  private selectedPoint: Point | null;
  private hoveredPoint: Point | null;
  private draggingPoint: boolean;

  // Listeners methods
  private boundMouseDown: (event: MouseEvent) => void;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundMouseUp: (event: MouseEvent) => void;
  private boundContextMenu: (event: Event) => void;

  public constructor(viewport: Viewport, graph: Graph) {
    this.viewport = viewport;
    this.canvas = this.viewport.canvas;
    this.context = this.canvas.getContext('2d')!;
    this.graph = graph;

    this.mousePoint = null;
    this.selectedPoint = null;
    this.hoveredPoint = null;
    this.draggingPoint = false;

    this.boundMouseDown = () => {};
    this.boundMouseMove = () => {};
    this.boundMouseUp = () => {};
    this.boundContextMenu = () => {};
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

  public enable() {
    this.addEventListeners();
  }

  public disable() {
    this.removeEventListeners();
    this.selectedPoint = null;
    this.hoveredPoint = null;
  }

  private addEventListeners(): void {
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundContextMenu = this.handleContextMenu.bind(this);

    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('mouseup', this.boundMouseUp);
    this.canvas.addEventListener('contextmenu', this.boundContextMenu);
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.boundMouseDown);
    this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    this.canvas.removeEventListener('mouseup', this.boundMouseUp);
    this.canvas.removeEventListener('contextmenu', this.boundContextMenu);
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

    this.hoveredPoint = Utils.getNearestPoint({
      point: this.mousePoint!,
      points: this.graph.points,
      threshold: 10 * this.viewport.zoom,
    });

    if (this.draggingPoint) {
      this.selectedPoint!.x = this.mousePoint!.x;
      this.selectedPoint!.y = this.mousePoint!.y;
    }
  }

  private handleMouseUp() {
    this.draggingPoint = false;
  }

  private handleContextMenu(event: Event): void {
    event.preventDefault();
  }
}
