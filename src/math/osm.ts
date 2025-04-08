import { Engine } from '../engine/engine.ts';
import { Utils } from '../engine/utils.ts';
import { Point } from '../primitives/point.ts';
import { Segment } from '../primitives/segment.ts';

export class Osm {
  public static parseRoads(data: Record<string, any>) {
    const nodes: Record<string, any>[] = data.elements.filter((node: any) => node.type === 'node');

    const latitudes: number[] = nodes.map((node) => node.lat);
    const longitudes: number[] = nodes.map((node) => node.lon);

    const minLatitude: number = Math.min(...latitudes);
    const maxLatitude: number = Math.max(...latitudes);
    const minLongitude: number = Math.min(...longitudes);
    const maxLongitude: number = Math.max(...longitudes);

    const deltaLatitude: number = maxLatitude - minLatitude;
    const deltaLongitude: number = maxLongitude - minLongitude;
    const aspectRatio: number = deltaLongitude / deltaLatitude;
    const height = deltaLatitude * 111000 * 10;
    const width: number = height * aspectRatio * Math.cos(Utils.degreeToRadio(maxLatitude));

    const points: any[] = [];
    const segments: Segment[] = [];

    for (const node of nodes) {
      const y = Utils.inverseLerp(maxLatitude, minLatitude, node.lat) * height;
      const x = Utils.inverseLerp(minLongitude, maxLongitude, node.lon) * width;
      const point: any = new Point(x, y);
      point.id = node.id;
      points.push(point);
    }

    const ways = data.elements.filter((way: any) => way.type === 'way');

    for (const way of ways) {
      const ids = way.nodes;

      for (let i = 1; i < ids.length; i++) {
        const previous = points.find((point) => point.id === ids[i - 1]);
        const current = points.find((point) => point.id === ids[i]);
        segments.push(new Segment(current, previous));
      }
    }

    Engine.graph.points = points;
    Engine.graph.segments = segments;
  }
}
