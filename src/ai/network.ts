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
}
