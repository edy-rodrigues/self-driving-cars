import type { Viewport } from '../engine/viewport.ts';
import type { IWorld, World } from '../engine/world.ts';
import { Crossing } from '../markings/crossing.ts';
import type { Point } from '../primitives/point.ts';
import { MarkingEditor } from './marking-editor.ts';

export class CrossingEditor extends MarkingEditor {
  public constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.graph.segments);
  }

  public createMarking(center: Point, directionVector: Point): IWorld.TMarking {
    return new Crossing(center, directionVector, this.world.roadWidth, this.world.roadWidth / 2);
  }
}
