import type { ICar } from '../items/car.ts';
import { Point } from '../primitives/point.ts';
import type { Segment } from '../primitives/segment.ts';

export declare namespace IUtils {
  interface IGetNearestPointParams {
    point: Point;
    points: Point[];
    threshold?: number;
  }

  interface IGetNearestSegmentParams {
    point: Point;
    segments: Segment[];
    threshold?: number;
  }

  interface IGetIntersectionPureCoordinateProps {
    x: number;
    y: number;
  }

  interface IGetIntersectionPureReturn {
    x: number;
    y: number;
    offset: number;
  }
}

export class Utils {
  public static getNearestPoint(params: IUtils.IGetNearestPointParams): Point | null {
    const { point, points, threshold = Number.MAX_SAFE_INTEGER } = params;

    let minimumDistance: number = Number.MAX_SAFE_INTEGER;
    let nearest: Point | null = null;

    for (const pointIterator of points) {
      const distance: number = Utils.getDistance(pointIterator, point);

      if (distance < minimumDistance && distance < threshold) {
        minimumDistance = distance;
        nearest = pointIterator;
      }
    }

    return nearest;
  }

  public static getNearestSegment(params: IUtils.IGetNearestSegmentParams): Segment | null {
    const { point, segments, threshold = Number.MAX_SAFE_INTEGER } = params;

    let minimumDistance: number = Number.MAX_SAFE_INTEGER;
    let nearest: Segment | null = null;

    for (const segmentIterator of segments) {
      const distance: number = segmentIterator.distanceToPoint(point);

      if (distance < minimumDistance && distance < threshold) {
        minimumDistance = distance;
        nearest = segmentIterator;
      }
    }

    return nearest;
  }

  public static add(pointOne: Point, pointTwo: Point): Point {
    return new Point(pointOne.x + pointTwo.x, pointOne.y + pointTwo.y);
  }

  public static subtract(pointOne: Point, pointTwo: Point): Point {
    return new Point(pointOne.x - pointTwo.x, pointOne.y - pointTwo.y);
  }

  public static translate(point: Point, angle: number, offset: number): Point {
    return new Point(point.x + Math.cos(angle) * offset, point.y + Math.sin(angle) * offset);
  }

  public static getDistance(pointOne: Point, pointTwo: Point): number {
    return Math.hypot(pointOne.x - pointTwo.x, pointOne.y - pointTwo.y);
  }

  public static angle(point: Point): number {
    return Math.atan2(point.y, point.x);
  }

  public static scale(point: Point, scaler: number): Point {
    return new Point(point.x * scaler, point.y * scaler);
  }

  public static normalize(point: Point): Point {
    return Utils.scale(point, 1 / Utils.magnitude(point));
  }

  public static magnitude(point: Point): number {
    return Math.hypot(point.x, point.y);
  }

  public static perpendicular(point: Point): Point {
    return new Point(-point.y, point.x);
  }

  public static average(pointOne: Point, pointTwo: Point): Point {
    return new Point((pointOne.x + pointTwo.x) / 2, (pointOne.y + pointTwo.y) / 2);
  }

  public static dot(pointOne: Point, pointTwo: Point): number {
    return pointOne.x * pointTwo.x + pointOne.y * pointTwo.y;
  }

  public static getIntersection(A: Point, B: Point, C: Point, D: Point) {
    const tTop: number = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop: number = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom: number = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    const eps: number = 0.001;

    if (Math.abs(bottom) > eps) {
      const t: number = tTop / bottom;
      const u: number = uTop / bottom;

      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: Utils.lerp(A.x, B.x, t),
          y: Utils.lerp(A.y, B.y, t),
          offset: t,
        };
      }
    }

    return null;
  }

  public static getIntersectionPure(
    A: IUtils.IGetIntersectionPureCoordinateProps,
    B: IUtils.IGetIntersectionPureCoordinateProps,
    C: IUtils.IGetIntersectionPureCoordinateProps,
    D: IUtils.IGetIntersectionPureCoordinateProps,
  ): IUtils.IGetIntersectionPureReturn | null {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom != 0) {
      const t = tTop / bottom;
      const u = uTop / bottom;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: Utils.lerp(A.x, B.x, t),
          y: Utils.lerp(A.y, B.y, t),
          offset: t,
        };
      }
    }

    return null;
  }

  public static polysIntersect(
    polyOne: ICar.IPolygonProps[],
    polyTwo: ICar.IPolygonProps[],
  ): boolean {
    for (let i = 0; i < polyOne.length; i++) {
      for (let j = 0; j < polyTwo.length; j++) {
        const touch = Utils.getIntersectionPure(
          polyOne[i],
          polyOne[(i + 1) % polyOne.length],
          polyTwo[j],
          polyTwo[(j + 1) % polyTwo.length],
        );

        if (touch) {
          return true;
        }
      }
    }

    return false;
  }

  public static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  public static lerp2D(A: Point, B: Point, t: number): Point {
    return new Point(Utils.lerp(A.x, B.x, t), Utils.lerp(A.y, B.y, t));
  }

  public static getFake3DPoint(point: Point, viewPoint: Point, height: number): Point {
    const direction: Point = Utils.normalize(Utils.subtract(point, viewPoint));
    const distance: number = Utils.getDistance(point, viewPoint);
    const scaler: number = Math.atan(distance / 300) / (Math.PI / 2);

    return Utils.add(point, Utils.scale(direction, height * scaler));
  }

  public static getRandomColor(): string {
    const hue: number = 290 + Math.random() * 260;
    return `hsl(${hue}, 100%, 60%)`;
  }

  public static getRGBA(value: number): string {
    const alpha = Math.abs(value);
    const R = value < 0 ? 0 : 255;
    const G = R;
    const B = value > 0 ? 0 : 255;
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  }

  public static createButton(icon: string) {
    const button = document.createElement('button');
    button.innerHTML = icon;

    return button;
  }
}
