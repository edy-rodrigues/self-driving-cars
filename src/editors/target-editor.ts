import type { Viewport } from '../engine/viewport.ts';
import type { IWorld, World } from '../engine/world.ts';
import { Target } from '../markings/target.ts';
import type { Point } from '../primitives/point.ts';
import { MarkingEditor } from './marking-editor.ts';

export class TargetEditor extends MarkingEditor {
  public constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  public createMarking(center: Point, directionVector: Point): IWorld.TMarking {
    return new Target(center, directionVector, this.world.roadWidth / 2, this.world.roadWidth / 2);
  }
}
