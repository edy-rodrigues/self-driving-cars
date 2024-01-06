import type { IWorld } from '../engine/world.ts';
import { Crossing } from '../markings/crossing.ts';
import { Light } from '../markings/light.ts';
import type { Marking } from '../markings/marking.ts';
import { Parking } from '../markings/parking.ts';
import { Start } from '../markings/start.ts';
import { Stop } from '../markings/stop.ts';
import { Target } from '../markings/target.ts';
import { Yield } from '../markings/yield.ts';
import { Point } from '../primitives/point.ts';

export class MarkingLoader {
  public static load(marking: Marking): IWorld.TMarking {
    const point: Point = new Point(marking.center.x, marking.center.y);
    const directionVector = new Point(marking.directionVector.x, marking.directionVector.y);

    switch (marking.type) {
      case 'crossing':
        return new Crossing(point, directionVector, marking.width, marking.height);
      case 'light':
        return new Light(point, directionVector, marking.width, marking.height);
      case 'parking':
        return new Parking(point, directionVector, marking.width, marking.height);
      case 'start':
        return new Start(point, directionVector, marking.width, marking.height);
      case 'stop':
        return new Stop(point, directionVector, marking.width, marking.height);
      case 'target':
        return new Target(point, directionVector, marking.width, marking.height);
      case 'yield':
        return new Yield(point, directionVector, marking.width, marking.height);
      default:
        throw new Error('Cannot render this marking object.');
    }
  }
}
