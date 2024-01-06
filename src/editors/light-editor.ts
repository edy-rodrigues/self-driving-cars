import type { Viewport } from '../engine/viewport.ts';
import type { IWorld, World } from '../engine/world.ts';
import { Light } from '../markings/light.ts';
import type { Point } from '../primitives/point.ts';
import { MarkingEditor } from './marking-editor.ts';

export class LightEditor extends MarkingEditor {
  public constructor(viewport: Viewport, world: World) {
    super(viewport, world, world.laneGuides);
  }

  public createMarking(center: Point, directionVector: Point): IWorld.TMarking {
    return new Light(center, directionVector, this.world.roadWidth / 2, this.world.roadWidth / 2);
  }
}
