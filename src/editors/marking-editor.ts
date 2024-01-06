import { Utils } from '../engine/utils.ts';
import type { Viewport } from '../engine/viewport.ts';
import type { IWorld, World } from '../engine/world.ts';
import { Marking } from '../markings/marking.ts';
import type { Point } from '../primitives/point.ts';
import type { Segment } from '../primitives/segment.ts';

export class MarkingEditor {
  protected readonly viewport: Viewport;
  protected readonly world: World;
  protected readonly canvas: HTMLCanvasElement;
  protected readonly context: CanvasRenderingContext2D;

  private mousePoint: Point | null;
  private intent: IWorld.TMarking | null;
  private readonly markings: IWorld.TMarking[];
  private readonly targetSegments: Segment[];

  // Listeners methods
  private boundMouseDown: (event: MouseEvent) => void;
  private boundMouseMove: (event: MouseEvent) => void;
  private boundContextMenu: (event: Event) => void;

  public constructor(viewport: Viewport, world: World, targetSegments: Segment[]) {
    this.viewport = viewport;
    this.world = world;
    this.canvas = this.viewport.canvas;
    this.context = this.canvas.getContext('2d')!;

    this.mousePoint = null;
    this.intent = null;
    this.markings = this.world.markings;
    this.targetSegments = targetSegments;

    this.boundMouseDown = () => {};
    this.boundMouseMove = () => {};
    this.boundContextMenu = () => {};
  }

  // To be overwritten by subclasses
  public createMarking(center: Point, directionVector: Point): IWorld.TMarking {
    return new Marking(center, directionVector, 0, 0);
  }

  public enable(): void {
    this.addEventListeners();
  }

  public disable(): void {
    this.removeEventListeners();
  }

  public display(): void {
    if (this.intent) {
      this.intent.draw({
        context: this.context,
      });
    }
  }

  private addEventListeners(): void {
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundContextMenu = this.handleContextMenu.bind(this);

    this.canvas.addEventListener('mousedown', this.boundMouseDown);
    this.canvas.addEventListener('mousemove', this.boundMouseMove);
    this.canvas.addEventListener('contextmenu', this.boundContextMenu);
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener('mousedown', this.boundMouseDown);
    this.canvas.removeEventListener('mousemove', this.boundMouseMove);
    this.canvas.removeEventListener('contextmenu', this.boundContextMenu);
  }

  private handleMouseDown(event: MouseEvent): void {
    // Left click
    if (event.button === 0) {
      if (this.intent) {
        this.markings.push(this.intent);
        this.intent = null;
      }
    }

    // Right click
    if (event.button === 2) {
      for (let i = 0; i < this.markings.length; i++) {
        const polygon = this.markings[i].polygon;

        if (polygon.containsPoint(this.mousePoint!)) {
          this.markings.splice(i, 1);
          return;
        }
      }
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    this.mousePoint = this.viewport.getMouse(event, true);

    const segment = Utils.getNearestSegment({
      point: this.mousePoint,
      segments: this.targetSegments,
      threshold: 10 * this.viewport.zoom,
    });

    if (segment) {
      const project = segment.projectPoint(this.mousePoint);

      if (project.offset >= 0 && project.offset <= 1) {
        this.intent = this.createMarking(project.point, segment.directionVector());
      } else {
        this.intent = null;
      }
    } else {
      this.intent = null;
    }
  }

  private handleContextMenu(event: Event): void {
    event.preventDefault();
  }
}
