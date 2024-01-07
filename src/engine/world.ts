import { Building } from '../items/building.ts';
import type { Car } from '../items/car.ts';
import { Tree } from '../items/tree.ts';
import { MarkingLoader } from '../loaders/marking-loader.ts';
import type { Crossing } from '../markings/crossing.ts';
import { Light } from '../markings/light.ts';
import type { Marking } from '../markings/marking.ts';
import type { Parking } from '../markings/parking.ts';
import { Start } from '../markings/start.ts';
import type { Stop } from '../markings/stop.ts';
import type { Target } from '../markings/target.ts';
import type { Yield } from '../markings/yield.ts';
import { Graph } from '../math/graph.ts';
import { Envelope } from '../primitives/envelope.ts';
import { Point } from '../primitives/point.ts';
import { Polygon } from '../primitives/polygon.ts';
import { Segment } from '../primitives/segment.ts';
import { Utils } from './utils.ts';

export declare namespace IWorld {
  type TMarking = Stop | Crossing | Start | Parking | Light | Target | Yield;
  type TTypeMarking =
    | 'crossing'
    | 'light'
    | 'marking'
    | 'parking'
    | 'start'
    | 'stop'
    | 'target'
    | 'yield';

  interface IDrawParams {
    context: CanvasRenderingContext2D;
    viewPoint: Point;
    showStartMarkings?: boolean;
  }
}

export class World {
  public zoom: number;
  public offset: Point;
  public graph: Graph;

  public buildings: Building[] = [];
  private envelopes: Envelope[];
  public roadBorders: Segment[];
  private trees: Tree[] = [];
  public bestCar: Car | null;
  public cars: Car[];
  public laneGuides: Segment[];
  public markings: IWorld.TMarking[] = [];

  public roadWidth: number;
  public roadRoundness: number;
  public buildingWidth: number;
  public buildingMinLength: number;
  public spacing: number;
  public treeSize: number;

  public frameCount: number;

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
    this.zoom = 1;
    this.offset = new Point(0, 0);

    this.roadWidth = roadWidth;
    this.roadRoundness = roadRoundness;
    this.buildingWidth = buildingWidth;
    this.buildingMinLength = buildingMinLength;
    this.spacing = spacing;
    this.treeSize = treeSize;

    this.bestCar = null;
    this.buildings = [];
    this.cars = [];
    this.envelopes = [];
    this.laneGuides = [];
    this.markings = [];
    this.roadBorders = [];
    this.trees = [];

    this.frameCount = 0;

    this.generate();
  }

  public static load(world: World): World {
    const newWorld: World = new World(new Graph());

    newWorld.graph = Graph.load(world.graph);

    newWorld.roadWidth = world.roadWidth;
    newWorld.roadRoundness = world.roadRoundness;
    newWorld.buildingWidth = world.buildingWidth;
    newWorld.buildingMinLength = world.buildingMinLength;
    newWorld.spacing = world.spacing;
    newWorld.treeSize = world.treeSize;

    newWorld.envelopes = world.envelopes.map((envelope: Envelope) => Envelope.load(envelope));
    newWorld.roadBorders = world.roadBorders.map(
      (roadBord: Segment) => new Segment(roadBord.p1, roadBord.p2),
    );
    newWorld.buildings = world.buildings.map((building: Building) => Building.load(building));
    newWorld.trees = world.trees.map((tree: Tree) => new Tree(tree.center, world.treeSize));
    newWorld.laneGuides = world.laneGuides.map(
      (laneGuide: Segment) => new Segment(laneGuide.p1, laneGuide.p2),
    );
    newWorld.markings = world.markings.map((marking: Marking) => MarkingLoader.load(marking));
    newWorld.zoom = world.zoom;
    newWorld.offset = new Point(world.offset.x, world.offset.y);

    return newWorld;
  }

  public generate(): void {
    this.envelopes = [];

    for (const segment of this.graph.segments) {
      this.envelopes.push(new Envelope(segment, this.roadWidth, this.roadRoundness));
    }

    this.roadBorders = Polygon.union(this.envelopes.map((envelope: Envelope) => envelope.polygon));
    this.buildings = this.generateBuildings();
    this.trees = this.generateTrees();

    this.laneGuides = [];
    this.laneGuides.push(...this.generateLaneGuides());
  }

  private generateLaneGuides(): Segment[] {
    const tempEnvelopes: Envelope[] = [];

    for (const segment of this.graph.segments) {
      tempEnvelopes.push(new Envelope(segment, this.roadWidth / 2, this.roadRoundness));
    }

    return Polygon.union(tempEnvelopes.map((envelope: Envelope) => envelope.polygon));
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

  private getIntersections(): Point[] {
    const subset: Point[] = [];

    for (const point of this.graph.points) {
      let degree: number = 0;

      for (const segment of this.graph.segments) {
        if (segment.includes(point)) {
          degree++;
        }
      }

      if (degree > 2) {
        subset.push(point);
      }
    }

    return subset;
  }

  private updateLights(): void {
    const lights: IWorld.TMarking[] = this.markings.filter(
      (marking: IWorld.TMarking) => marking instanceof Light,
    );

    const controlCenters: any[] = [];

    for (const light of lights) {
      let point: Point | null = Utils.getNearestPoint({
        point: light.center,
        points: this.getIntersections(),
      });

      if (!point) {
        point = Utils.getNearestPoint({
          point: light.center,
          points: this.graph.points,
        });
      }

      let controlCenter: any | undefined = controlCenters.find((controlCenter) =>
        controlCenter.equals(point!),
      );

      if (!controlCenter) {
        controlCenter = new Point(point!.x, point!.y);
        controlCenter.lights = [light];
        controlCenters.push(controlCenter);
      } else {
        controlCenter.lights.push(light);
      }
    }

    const greenDuration: number = 2;
    const yellowDuration: number = 1;

    for (const controlCenter of controlCenters) {
      controlCenter.ticks = controlCenter.lights.length * (greenDuration + yellowDuration);
    }

    const tick = Math.floor(this.frameCount / 60);

    for (const controlCenter of controlCenters) {
      const cTick = tick % controlCenter.ticks;
      const greenYellowIndex = Math.floor(cTick / (greenDuration + yellowDuration));
      const greenYellowState =
        cTick % (greenDuration + yellowDuration) < greenDuration ? 'green' : 'yellow';

      for (let i = 0; i < controlCenter.lights.length; i++) {
        if (i === greenYellowIndex) {
          controlCenter.lights[i].state = greenYellowState;
        } else {
          controlCenter.lights[i].state = 'red';
        }
      }
    }

    this.frameCount++;
  }

  public draw(params: IWorld.IDrawParams): void {
    const { context, viewPoint, showStartMarkings = true } = params;

    this.updateLights();

    for (const envelope of this.envelopes) {
      envelope.draw({
        context,
        fill: '#bbb',
        stroke: '#bbb',
      });
    }

    for (const marking of this.markings) {
      if (!(marking instanceof Start) || showStartMarkings) {
        marking.draw({ context });
      }
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

    context.globalAlpha = 0.2;
    for (const car of this.cars) {
      car.draw({ context });
    }
    context.globalAlpha = 1;
    if (this.bestCar) {
      this.bestCar.draw({ context, sensor: true });
    }

    const items = [...this.buildings, ...this.trees];
    items.sort((a, b) => b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint));

    for (const item of items) {
      item.draw({ context, viewPoint });
    }
  }
}
