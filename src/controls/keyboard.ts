export class KeyboardControl {
  public forward: boolean;
  public right: boolean;
  public left: boolean;
  public reverse: boolean;

  public constructor() {
    this.forward = false;
    this.right = false;
    this.left = false;
    this.reverse = false;

    this.addEventListeners();
  }

  private addEventListeners(): void {
    console.log('addEventListeners');
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
