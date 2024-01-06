import type { Graph } from '../math/graph.ts';
import { Envelope } from '../primitives/envelope.ts';
import { Polygon } from '../primitives/polygon.ts';
import type { Segment } from '../primitives/segment.ts';

export class World {
  private readonly graph: Graph;
  private envelopes: Envelope[];
  private roadBorders: Segment[];
  private readonly roadWidth: number;
  private readonly roadRoundness: number;

  public constructor(graph: Graph, roadWidth: number = 100, roadRoundness: number = 10) {
    this.graph = graph;
    this.roadWidth = roadWidth;
    this.roadRoundness = roadRoundness;

    this.envelopes = [];
    this.roadBorders = [];

    this.generate();
  }

  public generate(): void {
    this.envelopes = [];

    for (const segment of this.graph.segments) {
      this.envelopes.push(new Envelope(segment, this.roadWidth, this.roadRoundness));
    }

    this.roadBorders = Polygon.union(this.envelopes.map((envelope: Envelope) => envelope.polygon));
  }

  public draw(context: CanvasRenderingContext2D): void {
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
  }
}
