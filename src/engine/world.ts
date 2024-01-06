import { Building } from '../items/building.ts';
import { Tree } from '../items/tree.ts';
import type { Graph } from '../math/graph.ts';
import { Envelope } from '../primitives/envelope.ts';
import { Point } from '../primitives/point.ts';
import { Polygon } from '../primitives/polygon.ts';
import { Segment } from '../primitives/segment.ts';
import { Utils } from './utils.ts';

export declare namespace IWorld {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
    viewPoint: Point;
  }
}

export class World {
  private readonly graph: Graph;
  private envelopes: Envelope[];
  private roadBorders: Segment[];
  private readonly roadWidth: number;
  private readonly roadRoundness: number;
  private readonly buildingWidth: number;
  private readonly buildingMinLength: number;
  private readonly spacing: number;
  private readonly treeSize: number;
  private buildings: Building[] = [];
  private trees: Tree[] = [];

  public constructor(
    graph: Graph,
    roadWidth: number = 100,
    roadRoundness: number = 10,
    buildingWidth: number = 150,
    buildingMinLength: number = 150,
    spacing: number = 50,
    treeSize: number = 160,
  ) {
    this.graph = graph;

    this.roadWidth = roadWidth;
    this.roadRoundness = roadRoundness;

    this.buildingWidth = buildingWidth;
    this.buildingMinLength = buildingMinLength;
    this.spacing = spacing;
    this.treeSize = treeSize;

    this.buildings = [];

    this.envelopes = [];
    this.roadBorders = [];
    this.trees = [];

    this.generate();
  }

  public generate(): void {
    this.envelopes = [];

    for (const segment of this.graph.segments) {
      this.envelopes.push(new Envelope(segment, this.roadWidth, this.roadRoundness));
    }

    this.roadBorders = Polygon.union(this.envelopes.map((envelope: Envelope) => envelope.polygon));
    this.buildings = this.generateBuildings();
    this.trees = this.generateTrees();
  }

  private generateTrees(): Tree[] {
    const points: Point[] = [
      ...this.roadBorders.map((segment: Segment) => [segment.p1, segment.p2]).flat(),
      ...this.buildings.map((building: Building) => building.base.points).flat(),
    ];

    const left: number = Math.min(...points.map((point: Point) => point.x));
    const right: number = Math.max(...points.map((point: Point) => point.x));
    const top: number = Math.min(...points.map((point: Point) => point.y));
    const bottom: number = Math.max(...points.map((point: Point) => point.y));

    const illegalPolygons: Polygon[] = [
      ...this.buildings.map((building: Building) => building.base),
      ...this.envelopes.map((envelope: Envelope) => envelope.polygon),
    ];

    const trees: Tree[] = [];
    let tryCount: number = 0;

    while (tryCount < 100) {
      const point: Point = new Point(
        Utils.lerp(left, right, Math.random()),
        Utils.lerp(bottom, top, Math.random()),
      );

      let keep: boolean = true;

      // check if tree inside or nearby building or road
      for (const illegalPolygon of illegalPolygons) {
        if (
          illegalPolygon.containsPoint(point) ||
          illegalPolygon.distanceToPoint(point) < this.treeSize / 2
        ) {
          keep = false;
          break;
        }
      }

      // check if tree too close to other trees
      if (keep) {
        for (const tree of trees) {
          if (Utils.getDistance(tree.center, point) < this.treeSize) {
            keep = false;
            break;
          }
        }
      }

      // avoiding trees in the middle of nowhere
      if (keep) {
        let closeToSomething: boolean = false;

        for (const illegalPolygon of illegalPolygons) {
          if (illegalPolygon.distanceToPoint(point) < this.treeSize * 2) {
            closeToSomething = true;
            break;
          }
        }

        keep = closeToSomething;
      }

      if (keep) {
        trees.push(new Tree(point, this.treeSize));
        tryCount = 0;
      }

      tryCount++;
    }

    return trees;
  }

  private generateBuildings(): Building[] {
    const tempEnvelopes: Envelope[] = [];

    for (const segment of this.graph.segments) {
      tempEnvelopes.push(
        new Envelope(
          segment,
          this.roadWidth + this.buildingWidth + this.spacing * 2,
          this.roadRoundness,
        ),
      );
    }

    const guides: Segment[] = Polygon.union(
      tempEnvelopes.map((envelope: Envelope) => envelope.polygon),
    );

    for (let i: number = 0; i < guides.length; i++) {
      const segment: Segment = guides[i];

      if (segment.length() < this.buildingMinLength) {
        guides.splice(i, 1);
        i--;
      }
    }

    const supports: Segment[] = [];

    for (let segment of guides) {
      const length: number = segment.length() + this.spacing;
      const buildingCount: number = Math.floor(length / (this.buildingMinLength + this.spacing));
      const buildingLength: number = length / buildingCount - this.spacing;

      const direction: Point = segment.directionVector();

      let q1: Point = segment.p1;
      let q2: Point = Utils.add(q1, Utils.scale(direction, buildingLength));
      supports.push(new Segment(q1, q2));

      for (let i: number = 2; i <= buildingCount; i++) {
        q1 = Utils.add(q2, Utils.scale(direction, this.spacing));
        q2 = Utils.add(q1, Utils.scale(direction, buildingLength));

        supports.push(new Segment(q1, q2));
      }
    }

    const bases: Polygon[] = [];

    for (const segment of supports) {
      bases.push(new Envelope(segment, this.buildingWidth).polygon);
    }

    const eps = 0.001;
    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (
          bases[i].intersectsPolygon(bases[j]) ||
          bases[i].distanceToPolygon(bases[j]) < this.spacing - eps
        ) {
          bases.splice(j, 1);
          j--;
        }
      }
    }

    return bases.map((base) => new Building(base));
  }

  public draw(params: IWorld.IDrawParams): void {
    const { context, viewPoint } = params;

    for (const envelope of this.envelopes) {
      envelope.draw({
        context,
        fill: '#bbb',
        stroke: '#bbb',
      });
    }

    for (const segment of this.graph.segments) {
      segment.draw({
        context,
        color: 'white',
        width: 4,
        dash: [10, 10],
      });
    }

    for (const roadBorder of this.roadBorders) {
      roadBorder.draw({
        context,
        color: 'white',
        width: 4,
      });
    }

    const items = [...this.buildings, ...this.trees];

    items.sort((a, b) => b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint));

    for (const item of items) {
      item.draw({ context, viewPoint });
    }
  }
}
