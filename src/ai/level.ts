export class Level {
  public readonly inputs: number[];
  public readonly outputs: number[];
  public readonly biases: number[];
  public readonly weights: number[][];

  public constructor(inputCount: number, outputCount: number) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);

    this.weights = [];

    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }

    Level.randomize(this);
  }

  private static randomize(level: Level): void {
    for (let i: number = 0; i < level.inputs.length; i++) {
      for (let j: number = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }

    for (let i: number = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  public static feedForward(givenInputs: number[], level: Level): number[] {
    for (let i: number = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }

    for (let i: number = 0; i < level.outputs.length; i++) {
      let sum: number = 0;

      for (let j: number = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }

      if (sum > level.biases[i]) {
        level.outputs[i] = 1;
      } else {
        level.outputs[i] = 0;
      }
    }

    return level.outputs;
  }
}
