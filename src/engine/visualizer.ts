import type { Level } from '../ai/level.ts';
import type { NeuralNetwork } from '../ai/network.ts';
import { Utils } from './utils.ts';

export declare namespace IVisualizer {
  interface IDrawLevelParams {
    context: CanvasRenderingContext2D;
    level: Level;
    left: number;
    top: number;
    width: number;
    height: number;
    labels: string[];
  }
}

export class Visualizer {
  public static drawNetwork(context: CanvasRenderingContext2D, network: NeuralNetwork): void {
    const margin: number = 50;
    const left: number = margin;
    const top: number = margin;
    const width: number = context.canvas.width - margin * 2;
    const height: number = context.canvas.height - margin * 2;

    const levelHeight: number = height / network.levels.length;

    for (let i: number = network.levels.length - 1; i >= 0; i--) {
      const levelTop: number =
        top +
        Utils.lerp(
          height - levelHeight,
          0,
          network.levels.length === 1 ? 0.5 : i / (network.levels.length - 1),
        );

      context.setLineDash([20, 15]);
      Visualizer.drawLevel({
        context,
        level: network.levels[i],
        left,
        top: levelTop,
        width,
        height: levelHeight,
        labels: i === network.levels.length - 1 ? ['🡩', '🡨', '🡪', '🡫'] : [],
      });
    }
  }

  public static drawLevel(params: IVisualizer.IDrawLevelParams): void {
    const { level, top, width, height, left, context, labels } = params;

    const right: number = left + width;
    const bottom: number = top + height;

    const { inputs, outputs, weights, biases } = level;

    for (let i: number = 0; i < inputs.length; i++) {
      for (let j: number = 0; j < outputs.length; j++) {
        context.beginPath();
        context.moveTo(Visualizer.getNodeX(inputs, i, left, right), bottom);
        context.lineTo(Visualizer.getNodeX(outputs, j, left, right), top);
        context.lineWidth = 2;
        context.strokeStyle = Utils.getRGBA(weights[i][j]);
        context.stroke();
      }
    }

    const nodeRadius: number = 18;

    for (let i: number = 0; i < inputs.length; i++) {
      const x: number = Visualizer.getNodeX(inputs, i, left, right);

      context.beginPath();
      context.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
      context.fillStyle = 'black';
      context.fill();

      context.beginPath();
      context.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
      context.fillStyle = Utils.getRGBA(inputs[i]);
      context.fill();
    }

    for (let i: number = 0; i < outputs.length; i++) {
      const x: number = Visualizer.getNodeX(outputs, i, left, right);

      context.beginPath();
      context.arc(x, top, nodeRadius, 0, Math.PI * 2);
      context.fillStyle = 'black';
      context.fill();

      context.beginPath();
      context.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
      context.fillStyle = Utils.getRGBA(outputs[i]);
      context.fill();

      context.beginPath();
      context.lineWidth = 2;
      context.arc(x, top, nodeRadius * 0.8, 0, Math.PI * 2);
      context.strokeStyle = Utils.getRGBA(biases[i]);
      context.setLineDash([3, 3]);
      context.stroke();
      context.setLineDash([]);

      if (i === outputs.length - 1) {
        context.beginPath();
        context.arc(x + 30, top, nodeRadius, 0, Math.PI * 2);
        context.fillStyle = 'black';
        context.fill();

        context.beginPath();
        context.lineWidth = 2;
        context.arc(x + 30, top, nodeRadius * 0.8, 0, Math.PI * 2);
        context.strokeStyle = Utils.getRGBA(biases[i]);
        context.setLineDash([3, 3]);
        context.stroke();
        context.setLineDash([]);
      }

      if (labels[i]) {
        context.beginPath();
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = 'black';
        context.strokeStyle = 'white';
        context.font = `${nodeRadius * 1.3}px Arial`;
        context.fillText(labels[i], x, top + nodeRadius * 0.1);
        context.lineWidth = 0.5;
        context.strokeText(labels[i], x, top + nodeRadius * 0.1);
      }
    }
  }

  private static getNodeX<T>(nodes: T[], index: number, left: number, right: number): number {
    return Utils.lerp(left, right, nodes.length === 1 ? 0.5 : index / (nodes.length - 1));
  }
}
