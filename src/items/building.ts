import { Utils } from '../engine/utils.ts';
import type { Point } from '../primitives/point.ts';
import { Polygon } from '../primitives/polygon.ts';

export declare namespace IBuilding {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
    viewPoint: Point;
  }
}

export class Building {
  public readonly base: Polygon;
  private readonly height: number;

  public constructor(polygon: Polygon, heightCoefficient: number = 200) {
    this.base = polygon;
    this.height = heightCoefficient;
  }

  public static load(building: Building): Building {
    return new Building(Polygon.load(building.base), building.height);
  }

  public draw(params: IBuilding.IDrawParams): void {
    const { context, viewPoint } = params;

    const topPoints: Point[] = this.base.points.map((point: Point) =>
      Utils.getFake3DPoint(point, viewPoint, this.height * 0.6),
    );
    const ceiling: Polygon = new Polygon(topPoints);

    const sides: Polygon[] = [];

    for (let i: number = 0; i < this.base.points.length; i++) {
      const nextI: number = (i + 1) % this.base.points.length;
      const polygon: Polygon = new Polygon([
        this.base.points[i],
        this.base.points[nextI],
        topPoints[nextI],
        topPoints[i],
      ]);
      sides.push(polygon);
    }

    sides.sort(
      (a: Polygon, b: Polygon) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint),
    );

    const baseMidPoints: Point[] = [
      Utils.average(this.base.points[0], this.base.points[1]),
      Utils.average(this.base.points[2], this.base.points[3]),
    ];

    const topMidPoints = baseMidPoints.map((point: Point) =>
      Utils.getFake3DPoint(point, viewPoint, this.height),
    );

    const roofPolygons: Polygon[] = [
      new Polygon([ceiling.points[0], ceiling.points[3], topMidPoints[1], topMidPoints[0]]),
      new Polygon([ceiling.points[2], ceiling.points[1], topMidPoints[0], topMidPoints[1]]),
    ];
    roofPolygons.sort(
      (a: Polygon, b: Polygon) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint),
    );

    this.base.draw({
      context,
      stroke: 'rgba(0, 0, 0, 0.2)',
      lineWidth: 20,
    });
    for (const side of sides) {
      side.draw({
        context,
        fill: 'white',
        stroke: '#aaa',
      });
    }
    ceiling.draw({
      context,
      stroke: 'white',
      fill: 'white',
      lineWidth: 6,
    });
    for (const roofPolygon of roofPolygons) {
      roofPolygon.draw({
        context,
        fill: '#d44',
        stroke: '#c44',
        lineWidth: 8,
        join: 'round',
      });
    }
  }
}
