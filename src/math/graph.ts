import { Point } from '../primitives/point.ts';
import { Segment } from '../primitives/segment.ts';

export declare namespace IGraph {}

export class Graph {
  public points: Point[] = [];
  public segments: Segment[] = [];

  public constructor(points: Point[] = [], segments: Segment[] = []) {
    this.points = points;
    this.segments = segments;
  }

  public static load(graph: Graph): Graph {
    const points = graph.points.map((point: Point) => new Point(point.x, point.y));
    const segments = graph.segments.map(
      (segment: Segment) =>
        new Segment(
          points.find((point: Point) => point.equals(segment.p1))!,
          points.find((point: Point) => point.equals(segment.p2))!,
          segment.oneWay,
        ),
    );

    return new Graph(points, segments);
  }

  public hash(): string {
    return JSON.stringify(this);
  }

  public draw(context: CanvasRenderingContext2D) {
    for (const segment of this.segments) {
      segment.draw({
        context,
      });
    }

    for (const point of this.points) {
      point.draw({
        context,
      });
    }
  }

  public addPoint(point: Point): void {
    this.points.push(point);
  }

  public containsPoint(point: Point): boolean {
    return !!this.points.find((p) => p.equals(point));
  }

  public tryAddPoint(point: Point): boolean {
    if (!this.containsPoint(point)) {
      this.addPoint(point);

      return true;
    }

    return false;
  }

  public removePoint(point: Point): void {
    const segments = this.getSegmentsWithPoint(point);

    for (const segment of segments) {
      this.removeSegment(segment);
    }

    this.points.splice(this.points.indexOf(point), 1);
  }

  public addSegment(segment: Segment): void {
    this.segments.push(segment);
  }

  public containsSegment(segment: Segment): boolean {
    return !!this.segments.find((s) => s.equals(segment));
  }

  public getSegmentsWithPoint(point: Point): Segment[] {
    const segments: Segment[] = [];

    for (const segment of this.segments) {
      if (segment.includes(point)) {
        segments.push(segment);
      }
    }

    return segments;
  }

  public tryAddSegment(segment: Segment): boolean {
    if (!this.containsSegment(segment) && !segment.p1.equals(segment.p2)) {
      this.addSegment(segment);

      return true;
    }

    return false;
  }

  public removeSegment(segment: Segment): void {
    this.segments.splice(this.segments.indexOf(segment), 1);
  }

  public dispose() {
    this.points = [];
    this.segments = [];
  }
}
