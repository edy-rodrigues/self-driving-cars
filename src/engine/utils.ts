import { Point } from '../primitives/point.ts';

export class Utils {
  public static add(pointOne: Point, pointTwo: Point): Point {
    return new Point(pointOne.x + pointTwo.x, pointOne.y + pointTwo.y);
  }

  public static subtract(pointOne: Point, pointTwo: Point): Point {
    return new Point(pointOne.x - pointTwo.x, pointOne.y - pointTwo.y);
  }

  public static translate(point: Point, angle: number, offset: number): Point {
    return new Point(point.x + Math.cos(angle) * offset, point.y + Math.sin(angle) * offset);
  }

  public static angle(point: Point): number {
    return Math.atan2(point.y, point.x);
  }

  public static average(pointOne: Point, pointTwo: Point): Point {
    return new Point((pointOne.x + pointTwo.x) / 2, (pointOne.y + pointTwo.y) / 2);
  }

  public static getIntersection(A: Point, B: Point, C: Point, D: Point) {
    const tTop: number = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop: number = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom: number = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

    if (bottom !== 0) {
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

  public static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  public static getRandomColor() {
    const hue = 290 + Math.random() * 260;
    return `hsl(${hue}, 100%, 60%)`;
  }
}
