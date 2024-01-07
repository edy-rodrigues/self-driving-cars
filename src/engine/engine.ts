import { NeuralNetwork } from '../ai/network.ts';
import { CrossingEditor } from '../editors/crossing-editor.ts';
import { GraphEditor } from '../editors/graph-editor.ts';
import { LightEditor } from '../editors/light-editor.ts';
import { ParkingEditor } from '../editors/parking-editor.ts';
import { StartEditor } from '../editors/start-editor.ts';
import { StopEditor } from '../editors/stop-editor.ts';
import { TargetEditor } from '../editors/target-editor.ts';
import { YieldEditor } from '../editors/yield-editor.ts';
import { Car } from '../items/car.ts';
import { Start } from '../markings/start.ts';
import { Graph } from '../math/graph.ts';
import { Point } from '../primitives/point.ts';
import type { Segment } from '../primitives/segment.ts';
import { Controllers } from './controllers.ts';
import { Utils } from './utils.ts';
import { Viewport } from './viewport.ts';
import { Visualizer } from './visualizer.ts';
import type { IWorld } from './world.ts';
import { World } from './world.ts';

const IAMaxSpeed = 3;
const brainDiff = 0.2;
const control = 'ai';
const carsCount = 800;

export declare namespace IEngine {
  interface ITool {
    button: HTMLButtonElement;
    editor:
      | GraphEditor
      | StopEditor
      | CrossingEditor
      | StartEditor
      | ParkingEditor
      | LightEditor
      | TargetEditor
      | YieldEditor;
  }

  interface ITools {
    graph: IEngine.ITool;
    stop: IEngine.ITool;
    crossing: IEngine.ITool;
    start: IEngine.ITool;
    parking: IEngine.ITool;
    light: IEngine.ITool;
    target: IEngine.ITool;
    yield: IEngine.ITool;
  }
}

export class Engine {
  public static canvas: HTMLCanvasElement;
  public static context: CanvasRenderingContext2D;
  public static visualizer: HTMLCanvasElement;
  public static visualizerContext: CanvasRenderingContext2D;
  public static graph: Graph;
  public static tools: IEngine.ITools;
  public static viewport: Viewport;
  public static world: World;
  public static oldGraphHash: string;
  public static cars: Car[];
  public static bestCar: Car;
  public static roads: Point[][];
  public static traffic: Car[];

  public static start(): void {
    const app: HTMLDivElement = document.querySelector('#app')! as HTMLDivElement;

    const container = document.createElement('div');
    container.setAttribute('id', 'container');

    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.setAttribute('id', 'world');
    Engine.canvas = canvas;

    const visualizer: HTMLCanvasElement = document.createElement('canvas');
    visualizer.setAttribute('id', 'visualizer');
    Engine.visualizer = visualizer;
    Engine.visualizerContext = visualizer.getContext('2d')!;

    Engine.traffic = [];

    container.appendChild(canvas);
    container.appendChild(visualizer);
    app.appendChild(container);
    Controllers.draw(app);

    canvas.width = window.innerWidth / 2 + 200;
    canvas.height = 800;
    visualizer.width = window.innerWidth / 2 - 200;
    visualizer.height = 800;

    Engine.context = canvas.getContext('2d')!;

    const worldString: string | null = localStorage.getItem('world');
    const worldInfo: World | null = worldString ? JSON.parse(worldString) : null;
    let world: World = worldInfo ? World.load(worldInfo) : new World(new Graph());
    Engine.world = world;

    const graph: Graph = world.graph;
    Engine.graph = graph;

    const viewport: Viewport = new Viewport(canvas, world.zoom, world.offset);
    Engine.viewport = viewport;

    Engine.roads = world.roadBorders.map((segment: Segment) => [segment.p1, segment.p2]);
    Engine.cars = Engine.generateCars(carsCount);
    Engine.bestCar = Engine.cars[0];

    if (localStorage.getItem('bestBrain')) {
      for (let i = 0; i < Engine.cars.length; i++) {
        Engine.cars[i].brain = Engine.loadBestBrain()!;

        if (i !== 0) {
          NeuralNetwork.mutate(Engine.cars[i].brain!, brainDiff);
        }
      }
    }

    const tools: IEngine.ITools = {
      graph: {
        button: Controllers.ToolsButtons.graph,
        editor: new GraphEditor(viewport, graph),
      },
      stop: {
        button: Controllers.ToolsButtons.stop,
        editor: new StopEditor(viewport, world),
      },
      crossing: {
        button: Controllers.ToolsButtons.crossing,
        editor: new CrossingEditor(viewport, world),
      },
      start: {
        button: Controllers.ToolsButtons.start,
        editor: new StartEditor(viewport, world),
      },
      parking: {
        button: Controllers.ToolsButtons.parking,
        editor: new ParkingEditor(viewport, world),
      },
      light: {
        button: Controllers.ToolsButtons.light,
        editor: new LightEditor(viewport, world),
      },
      target: {
        button: Controllers.ToolsButtons.target,
        editor: new TargetEditor(viewport, world),
      },
      yield: {
        button: Controllers.ToolsButtons.yield,
        editor: new YieldEditor(viewport, world),
      },
    };
    Engine.tools = tools;

    Engine.oldGraphHash = graph.hash();

    setEditorMode('graph');

    Engine.animate(0);

    function setEditorMode(mode: keyof IEngine.ITools): void {
      disableEditors();
      tools[mode].button.style.backgroundColor = '#d1d1d1';
      tools[mode].button.style.filter = '';
      tools[mode].editor.enable();
    }

    function disableEditors(): void {
      for (const tool of Object.values(tools) as IEngine.ITool[]) {
        tool.button.style.backgroundColor = 'gray';
        tool.button.style.filter = 'grayscale(100%)';
        tool.editor.disable();
      }
    }

    for (const [mode, tool] of Object.entries(tools) as [keyof IEngine.ITools, IEngine.ITool][]) {
      tool.button.addEventListener('click', (): void => {
        setEditorMode(mode);
      });
    }
  }

  public static animate(time: number): void {
    const { tools, viewport, context, world, visualizerContext, cars } = Engine;

    for (let i = 0; i < cars.length; i++) {
      cars[i].update(Engine.roads, []);
    }

    const bestCar = cars.find(
      (car: Car): boolean => car.fitness === Math.max(...cars.map((car) => car.fitness)),
    )!;
    Engine.bestCar = bestCar;

    world.cars = cars;
    world.bestCar = bestCar;

    viewport.offset.x = -bestCar.x;
    viewport.offset.y = -bestCar.y;

    viewport.reset();

    const viewPoint: Point = Utils.scale(viewport.getOffset(), -1);
    world.draw({ context, viewPoint, showStartMarkings: false });

    context.globalAlpha = 0.3;

    for (const tool of Object.values(tools) as IEngine.ITool[]) {
      tool.editor.display();
    }

    // for (let i = 0; i < traffic.length; i++) {
    //   traffic[i].update([], []);
    // }

    // road.draw({ context });
    // for (let i = 0; i < traffic.length; i++) {
    //   traffic[i].draw({ context, color: 'red' });
    // }

    // context.globalAlpha = 0.2;
    // for (let i = 0; i < cars.length; i++) {
    //   cars[i].draw({ context });
    // }
    // context.globalAlpha = 1;
    // bestCar.draw({ context, sensor: true });

    // Visualizer drawing
    visualizerContext.clearRect(
      0,
      0,
      visualizerContext.canvas.width,
      visualizerContext.canvas.height,
    );
    visualizerContext.save();
    visualizerContext.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(visualizerContext, bestCar.brain!);
    visualizerContext.restore();

    requestAnimationFrame(Engine.animate);
  }

  private static generateCars(N: number): Car[] {
    const startPoints: IWorld.TMarking[] = Engine.world.markings.filter(
      (marking: IWorld.TMarking): boolean => marking instanceof Start,
    );
    const startPoint: Point = startPoints.length > 0 ? startPoints[0].center : new Point(100, 100);
    const directionVector: Point =
      startPoints.length > 0 ? startPoints[0].directionVector : new Point(0, -1);
    const startAngle = -Utils.angle(directionVector) + Math.PI / 2;

    const cars: Car[] = [];

    for (let i = 0; i < N; i++) {
      cars.push(new Car(startPoint.x, startPoint.y, 30, 50, control, startAngle, IAMaxSpeed));
    }

    return cars;
  }

  public static saveBestBrain(): void {
    localStorage.setItem('bestBrain', JSON.stringify(Engine.bestCar.brain));
    console.log('Save best brain!');
  }

  public static discardBestBrain(): void {
    localStorage.removeItem('bestBrain');
    console.log('Remove best brain!');
  }

  private static loadBestBrain(): NeuralNetwork | null {
    const bestBrainJSON = localStorage.getItem('bestBrain')!;

    console.log('Load best brain!');
    return JSON.parse(bestBrainJSON) as NeuralNetwork;
  }
}
