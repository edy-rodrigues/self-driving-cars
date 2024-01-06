import { KeyboardControl } from '../controls/keyboard.ts';

export declare namespace ICar {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }
}

export class Car {
  public x: number;
  public y: number;
  private speed: number;
  private readonly acceleration: number;
  private readonly maxSpeed: number;
  private readonly friction: number;
  private angle: number;
  private readonly width: number;
  private readonly height: number;

  private readonly control: KeyboardControl;

  public constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = 7;
    this.friction = 0.05;
    this.angle = 0;

    this.control = new KeyboardControl();
  }

  public update() {
    this.move();
  }

  private move(): void {
    if (this.control.forward) {
      this.speed += this.acceleration;
    }

    if (this.control.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }

    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }

    if (this.speed < 0) {
      this.speed += this.friction;
    }

    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1;

      if (this.control.right) {
        this.angle -= 0.03 * flip;
      }

      if (this.control.left) {
        this.angle += 0.03 * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  public draw(params: ICar.IDrawParams): void {
    const { context } = params;

    context.save();
    context.translate(this.x, this.y);
    context.rotate(-this.angle);
    context.beginPath();
    context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    context.fill();

    context.restore();
  }
}
