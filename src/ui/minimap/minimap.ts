import { Utils } from '../../engine/utils.ts';
import type { Graph } from '../../math/graph.ts';
import { Point } from '../../primitives/point.ts';

export declare namespace IMinimap {
  interface IProps {
    canvas: HTMLCanvasElement;
    graph: Graph;
    size: number;
    width: number;
    height: number;
    context: CanvasRenderingContext2D;
  }

  interface IConstructor {
    canvas: IProps['canvas'];
    graph: IProps['graph'];
    size: IProps['size'];
  }
}

export class Minimap {
  private props: IMinimap.IProps;

  public constructor(params: IMinimap.IConstructor) {
    this.props = {
      canvas: params.canvas,
      graph: params.graph,
      size: params.size,
      width: params.size,
      height: params.size,
      context: params.canvas.getContext('2d')!,
    };
  }

  public update(viewPoint: Point) {
    this.props.context.clearRect(0, 0, this.props.width, this.props.height);

    const scale = 0.05;
    const scaledViewPoint = Utils.scale(viewPoint, -scale);
    this.props.context.save();
    this.props.context.translate(
      scaledViewPoint.x + this.props.size / 2,
      scaledViewPoint.y + this.props.size / 2,
    );
    this.props.context.scale(scale, scale);

    for (const segments of this.props.graph.segments) {
      segments.draw({
        context: this.props.context,
        width: 3 / scale,
        color: 'white',
      });
    }

    this.props.context.restore();
    new Point(this.props.size / 2, this.props.size / 2).draw({
      context: this.props.context,
      color: 'blue',
      outline: true,
    });
  }
}
