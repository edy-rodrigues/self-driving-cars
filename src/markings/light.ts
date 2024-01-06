import { Utils } from '../engine/utils.ts';
import type { Point } from '../primitives/point.ts';
import { Segment } from '../primitives/segment.ts';
import { Marking } from './marking.ts';

export declare namespace ILight {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }
}

export class Light extends Marking {
  private readonly border: Segment;
  private state: 'green' | 'yellow' | 'red' | 'off';

  public constructor(center: Point, directionVector: Point, width: number, height: number) {
    super(center, directionVector, width, 18);

    this.type = 'light';
    this.state = 'off';
    this.border = this.polygon.segments[0];
  }

  public draw(params: ILight.IDrawParams): void {
    const { context } = params;

    const perpendicular: Point = Utils.perpendicular(this.directionVector);

    const line: Segment = new Segment(
      Utils.add(this.center, Utils.scale(perpendicular, this.width / 2)),
      Utils.add(this.center, Utils.scale(perpendicular, -this.width / 2)),
    );

    const green: Point = Utils.lerp2D(line.p1, line.p2, 0.2);
    const yellow: Point = Utils.lerp2D(line.p1, line.p2, 0.5);
    const red: Point = Utils.lerp2D(line.p1, line.p2, 0.8);

    new Segment(red, green).draw({ context, width: this.height, cap: 'round' });

    green.draw({ context, size: this.height * 0.6, color: '#060' });
    yellow.draw({ context, size: this.height * 0.6, color: '#660' });
    red.draw({ context, size: this.height * 0.6, color: '#600' });

    switch (this.state) {
      case 'green':
        green.draw({ context, size: this.height * 0.6, color: '#0F0' });
        break;
      case 'yellow':
        yellow.draw({ context, size: this.height * 0.6, color: '#FF0' });
        break;
      case 'red':
        red.draw({ context, size: this.height * 0.6, color: '#F00' });
        break;
    }
  }
}
