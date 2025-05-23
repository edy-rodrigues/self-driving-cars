import type { Car } from '../items/car.ts';
import type { Road } from '../items/road.ts';
import type { IUtils } from './utils.ts';
import { Utils } from './utils.ts';

export declare namespace ISensor {
  interface IDrawParams {
    context: CanvasRenderingContext2D;
  }

  interface ICollisionPosition {
    x: number;
    y: number;
    offset: number;
  }

  interface IRay {
    x: number;
    y: number;
  }

  interface IConstructorOptions {
    rayCount?: number;
    rayLength?: number;
    raySpread?: number;
    rayOffset?: number;
  }
}

export class Sensor {
  private readonly car: Car;
  public readonly rayCount: number;
  public readonly rayLength: number;
  public readonly raySpread: number;
  public readonly rayOffset: number;
  private rays: [ISensor.IRay, ISensor.IRay][];
  public readings: (ISensor.ICollisionPosition | null)[];

  public constructor(car: Car, options: ISensor.IConstructorOptions = {}) {
    this.car = car;
    this.rayCount = options.rayCount || 5;
    this.rayLength = options.rayLength || 150;
    this.raySpread = options.raySpread || Math.PI / 2;
    this.rayOffset = options.rayOffset || 0;

    this.rays = [];
    this.readings = [];
  }

  public update(roadBorders: Road['borders'], traffic: Car[]): void {
    this.castRays();
    this.readings = [];

    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.getReading(this.rays[i], roadBorders, traffic));
    }
  }

  private getReading(
    ray: ISensor.IRay[],
    roadBorders: Road['borders'],
    traffic: Car[],
  ): ISensor.ICollisionPosition | null {
    let touches = [];

    for (let i = 0; i < roadBorders.length; i++) {
      const touch: IUtils.IGetIntersectionPureReturn | null = Utils.getIntersectionPure(
        ray[0],
        ray[1],
        roadBorders[i][0],
        roadBorders[i][1],
      );

      if (touch) {
        touches.push(touch);
      }
    }

    for (let i = 0; i < traffic.length; i++) {
      const polygon = traffic[i].polygon;

      for (let j = 0; j < polygon.length; j++) {
        const value = Utils.getIntersectionPure(
          ray[0],
          ray[1],
          polygon[j],
          polygon[(j + 1) % polygon.length],
        );

        if (value) {
          touches.push(value);
        }
      }
    }

    if (touches.length === 0) {
      return null;
    } else {
      const offsets: number[] = touches.map((touch) => touch.offset);
      const minOffset: number = Math.min(...offsets);

      return touches.find((touch) => touch.offset === minOffset)!;
    }
  }

  private castRays(): void {
    this.rays = [];

    for (let i: number = 0; i < this.rayCount; i++) {
      const rayAngle: number =
        Utils.lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1),
        ) +
        this.car.angle +
        this.rayOffset;
      const start: ISensor.IRay = { x: this.car.x, y: this.car.y };
      const end: ISensor.IRay = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end]);
    }
  }

  public draw(params: ISensor.IDrawParams): void {
    const { context } = params;

    for (let i: number = 0; i < this.rayCount; i++) {
      let end: ISensor.IRay = this.rays[i][1];

      if (this.readings[i]) {
        end = this.readings[i]!;
      }

      context.beginPath();
      context.lineWidth = 3;
      context.strokeStyle = 'yellow';
      context.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      context.lineTo(end.x, end.y);
      context.stroke();

      context.beginPath();
      context.lineWidth = 3;
      context.strokeStyle = 'black';
      context.moveTo(this.rays[i][1].x, this.rays[i][1].y);
      context.lineTo(end.x, end.y);
      context.stroke();
    }
  }
}
