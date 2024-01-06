import { Utils } from '../engine/utils.ts';
import { Point } from './point.ts';
import { Segment } from './segment.ts';

export declare namespace IPolygon {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
    stroke?: CanvasFillStrokeStyles['strokeStyle'];
    lineWidth?: number;
    fill?: CanvasFillStrokeStyles['fillStyle'];
    join?: CanvasLineJoin;
  }
}

export class Polygon {
  public points: Point[];
  public readonly segments: Segment[];

  public constructor(points: Point[]) {
    this.points = points;
    this.segments = [];

    for (let i = 1; i <= this.points.length; i++) {
      this.segments.push(new Segment(this.points[i - 1], this.points[i % this.points.length]));
    }
  }

  public static load(polygon: Polygon): Polygon {
    return new Polygon(polygon.points.map((point: Point) => new Point(point.x, point.y)));
  }

  public static union(polygons: Polygon[]): Segment[] {
    Polygon.multiBreak(polygons);

    const keptSegments: Segment[] = [];

    for (let i = 0; i < polygons.length; i++) {
      for (const segment of polygons[i].segments) {
        let keep = true;

        for (let j = 0; j < polygons.length; j++) {
          if (i !== j) {
            if (polygons[j].containsSegment(segment)) {
              keep = false;
              break;
            }
          }
        }

        if (keep) {
          keptSegments.push(segment);
        }
      }
    }

    return keptSegments;
  }

  public static multiBreak(polygons: Polygon[]): void {
    for (let i = 0; i < polygons.length; i++) {
      for (let j = 0; j < polygons.length; j++) {
        Polygon.break(polygons[i], polygons[j]);
      }
    }
  }

  public static break(polygonOne: Polygon, polygonTwo: Polygon): void {
    const segmentsOne = polygonOne.segments;
    const segmentsTwo = polygonTwo.segments;

    for (let i = 0; i < segmentsOne.length; i++) {
      for (let j = 0; j < segmentsTwo.length; j++) {
        const intersection = Utils.getIntersection(
          segmentsOne[i].p1,
          segmentsOne[i].p2,
          segmentsTwo[j].p1,
          segmentsTwo[j].p2,
        );

        if (intersection && intersection.offset !== 1 && intersection.offset !== 0) {
          const point = new Point(intersection.x, intersection.y);

          let aux = segmentsOne[i].p2;
          segmentsOne[i].p2 = point;
          segmentsOne.splice(i + 1, 0, new Segment(point, aux));

          aux = segmentsTwo[j].p2;
          segmentsTwo[j].p2 = point;
          segmentsTwo.splice(j + 1, 0, new Segment(point, aux));
        }
      }
    }
  }

  public containsPoint(point: Point): boolean {
    const outerPoint = new Point(-1000, -1000);

    let intersectionCount = 0;

    for (const segment of this.segments) {
      const intersection = Utils.getIntersection(outerPoint, point, segment.p1, segment.p2);

      if (intersection) {
        intersectionCount++;
      }
    }

    return intersectionCount % 2 === 1;
  }

  public distanceToPoint(point: Point): number {
    return Math.min(...this.segments.map((segment: Segment) => segment.distanceToPoint(point)));
  }

  public distanceToPolygon(polygon: Polygon): number {
    return Math.min(...this.points.map((point: Point) => polygon.distanceToPoint(point)));
  }

  public intersectsPolygon(polygon: Polygon): boolean {
    for (const segmentOne of this.segments) {
      for (const segmentTwo of polygon.segments) {
        if (Utils.getIntersection(segmentOne.p1, segmentOne.p2, segmentTwo.p1, segmentTwo.p2)) {
          return true;
        }
      }
    }

    return false;
  }

  public containsSegment(segment: Segment): boolean {
    const midpoint = Utils.average(segment.p1, segment.p2);

    return this.containsPoint(midpoint);
  }

  public draw(params: IPolygon.IDrawParams): void {
    const {
      context,
      stroke = 'blue',
      lineWidth = 2,
      fill = 'rgba(0, 0, 255, 0.3)',
      join = 'miter',
    } = params;

    context.beginPath();
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.lineJoin = join;
    context.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i].x, this.points[i].y);
    }

    context.closePath();
    context.fill();
    context.stroke();
  }
}
