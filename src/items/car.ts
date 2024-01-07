import { NeuralNetwork } from '../ai/network.ts';
import cardPNG from '../assets/images/car.png';
import type { IControl } from '../controls/control.ts';
import { Control } from '../controls/control.ts';
import { Sensor } from '../engine/sensor.ts';
import { Utils } from '../engine/utils.ts';
import type { Road } from './road.ts';

export declare namespace ICar {
  interface IPolygonProps {
    x: number;
    y: number;
  }

  interface IDrawParams {
    context: CanvasRenderingContext2D;
    sensor?: boolean;
  }
}

export class Car {
  private readonly mask: HTMLCanvasElement;
  public x: number;
  public y: number;
  private speed: number;
  private readonly acceleration: number;
  private readonly maxSpeed: number;
  private readonly friction: number;
  public angle: number;
  private readonly width: number;
  private readonly height: number;
  private damaged: boolean;
  public fitness: number;

  public polygon: ICar.IPolygonProps[];
  private readonly image: HTMLImageElement;

  private readonly controlType: IControl.TType;
  private readonly control: Control;
  private readonly sensor?: Sensor;
  public brain?: NeuralNetwork;
  private readonly useBrain: boolean;

  public constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    controlType: IControl.TType,
    angle: number = 0,
    maxSpeed: number = 3,
    color: string = 'blue',
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = angle;
    this.damaged = false;
    this.fitness = 0;

    this.polygon = this.createPolygon();
    this.controlType = controlType;

    this.useBrain = this.controlType === 'ai';

    if (this.controlType !== 'dummy') {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }

    this.control = new Control(this.controlType);

    this.image = new Image();
    this.image.src = cardPNG;

    this.mask = document.createElement('canvas');
    this.mask.width = this.width;
    this.mask.height = this.height;

    const maskContext = this.mask.getContext('2d')!;
    this.image.onload = (): void => {
      maskContext.fillStyle = color;
      maskContext.rect(0, 0, this.width, this.height);
      maskContext.fill();

      maskContext.globalCompositeOperation = 'destination-atop';
      maskContext.drawImage(this.image, 0, 0, this.width, this.height);
    };
  }

  public update(roadBorders: Road['borders'], traffic: Car[]): void {
    if (!this.damaged) {
      this.move();
      this.fitness += this.speed;
      this.polygon = this.createPolygon();
      this.damaged = this.assessDamage(roadBorders, traffic);
    }

    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);

      const offsets = this.sensor.readings.map((reading) =>
        reading === null ? 0 : 1 - reading.offset,
      );

      const outputs = NeuralNetwork.feedForward(offsets, this.brain!);

      if (this.useBrain) {
        this.control.forward = !!outputs[0];
        this.control.right = !!outputs[1];
        this.control.left = !!outputs[2];
        this.control.reverse = !!outputs[3];
      }
    }
  }

  public assessDamage(roadBorders: Road['borders'], traffic: Car[]): boolean {
    for (let i = 0; i < roadBorders.length; i++) {
      if (Utils.polysIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }

    for (let i = 0; i < traffic.length; i++) {
      if (Utils.polysIntersect(this.polygon, traffic[i].polygon)) {
        return true;
      }
    }

    return false;
  }

  private createPolygon(): ICar.IPolygonProps[] {
    const points: ICar.IPolygonProps[] = [];
    const radius: number = Math.hypot(this.width, this.height) / 2;
    const alpha: number = Math.atan2(this.width, this.height);

    points.push({
      x: this.x - Math.sin(this.angle - alpha) * radius,
      y: this.y - Math.cos(this.angle - alpha) * radius,
    });

    points.push({
      x: this.x - Math.sin(this.angle + alpha) * radius,
      y: this.y - Math.cos(this.angle + alpha) * radius,
    });

    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * radius,
    });

    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * radius,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * radius,
    });

    return points;
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
    const { context, sensor = false } = params;

    if (this.sensor && sensor) {
      this.sensor.draw({ context });
    }

    context.save();
    context.translate(this.x, this.y);
    context.rotate(-this.angle);

    if (!this.damaged) {
      context.drawImage(this.mask, -this.width / 2, -this.height / 2, this.width, this.height);
      context.globalCompositeOperation = 'multiply';
    }

    context.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    context.restore();
  }
}
