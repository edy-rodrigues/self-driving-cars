import { Utils } from '../engine/utils.ts';
import { Level } from './level.ts';

export class NeuralNetwork {
  public readonly levels: Level[];

  public constructor(neuronCounts: number[]) {
    this.levels = [];

    for (let i: number = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }

  public static feedForward(givenInputs: number[], network: NeuralNetwork): number[] {
    let outputs: number[] = Level.feedForward(givenInputs, network.levels[0]);

    for (let i: number = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
    }

    return outputs;
  }

  public static mutate(network: NeuralNetwork, amount: number = 1): void {
    for (const level of network.levels) {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = Utils.lerp(level.biases[i], Math.random() * 2 - 1, amount);
      }

      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = Utils.lerp(level.weights[i][j], Math.random() * 2 - 1, amount);
        }
      }
    }
  }
}
