import { Utils } from '../engine/utils.ts';
import type { Point } from '../primitives/point.ts';
import { Polygon } from '../primitives/polygon.ts';

export declare namespace ITree {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
    viewPoint: Point;
  }
}

export class Tree {
  public readonly center: Point;
  private readonly size: number;
  private readonly heightCoefficient: number;
  public readonly base: Polygon;

  public constructor(center: Point, size: number, heightCoefficient: number = 0.3) {
    this.center = center;
    this.size = size; // size of the base
    this.heightCoefficient = heightCoefficient;
    this.base = this.generateLevel(this.center, this.size);
  }

  public draw(params: ITree.IDrawParams): void {
    const { context, viewPoint } = params;

    const difference: Point = Utils.subtract(this.center, viewPoint);
    const top: Point = Utils.add(this.center, Utils.scale(difference, this.heightCoefficient));

    const levelCount: number = 7;

    for (let level: number = 0; level < levelCount; level++) {
      const t: number = level / (levelCount - 1);
      const point: Point = Utils.lerp2D(this.center, top, t);

      const color: string = `rgb(30, ${Utils.lerp(50, 200, t)}, 70)`;
      const size: number = Utils.lerp(this.size, 40, t);

      const polygon = this.generateLevel(point, size);
      polygon.draw({ context, fill: color, stroke: 'rgba(0, 0, 0, 0)' });
    }
  }

  private generateLevel(point: Point, size: number): Polygon {
    const points: Point[] = [];

    const radius: number = size / 2;

    for (let a: number = 0; a < Math.PI * 2; a += Math.PI / 16) {
      const kindOfRandom: number = Math.cos(((a + this.center.x) * size) % 17) ** 2;
      const noisyRadius: number = radius * Utils.lerp(0.5, 1, kindOfRandom);
      points.push(Utils.translate(point, a, noisyRadius));
    }

    return new Polygon(points);
  }
}
