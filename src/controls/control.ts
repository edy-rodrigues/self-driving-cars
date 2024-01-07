export declare namespace IControl {
  type TType = 'keyboard' | 'ai' | 'dummy';
}

export class Control {
  public forward: boolean;
  public right: boolean;
  public left: boolean;
  public reverse: boolean;

  public constructor(type: IControl.TType) {
    this.forward = false;
    this.right = false;
    this.left = false;
    this.reverse = false;

    switch (type) {
      case 'keyboard':
        this.addEventListeners();
        break;
      case 'dummy':
        this.forward = true;
        break;
    }
  }

  private addEventListeners(): void {
    document.addEventListener('keydown', (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'ArrowLeft':
          this.left = true;
          break;
        case 'ArrowRight':
          this.right = true;
          break;
        case 'ArrowUp':
          this.forward = true;
          break;
        case 'ArrowDown':
          this.reverse = true;
          break;
      }
    });

    document.addEventListener('keyup', (event: KeyboardEvent): void => {
      switch (event.key) {
        case 'ArrowLeft':
          this.left = false;
          break;
        case 'ArrowRight':
          this.right = false;
          break;
        case 'ArrowUp':
          this.forward = false;
          break;
        case 'ArrowDown':
          this.reverse = false;
          break;
      }
    });
  }
}
