import { CrossingEditor } from '../editors/crossing-editor.ts';
import { GraphEditor } from '../editors/graph-editor.ts';
import { LightEditor } from '../editors/light-editor.ts';
import { ParkingEditor } from '../editors/parking-editor.ts';
import { StartEditor } from '../editors/start-editor.ts';
import { StopEditor } from '../editors/stop-editor.ts';
import { TargetEditor } from '../editors/target-editor.ts';
import { YieldEditor } from '../editors/yield-editor.ts';
import { Car } from '../items/car.ts';
import { Road } from '../items/road.ts';
import { Graph } from '../math/graph.ts';
import type { Point } from '../primitives/point.ts';
import { Utils } from './utils.ts';
import { Viewport } from './viewport.ts';
import { Visualizer } from './visualizer.ts';
import { World } from './world.ts';

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
  public static car: Car;
  public static road: Road;
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

    Engine.road = new Road(canvas.width / 2, canvas.width * 0.9);
    Engine.car = new Car(Engine.road.getLaneCenter(1), 300, 30, 50, 'ai', 2.5);
    Engine.traffic = [
      new Car(Engine.road.getLaneCenter(0), -100, 30, 50, 'dummy', 1),
      new Car(Engine.road.getLaneCenter(1), -150, 30, 50, 'dummy', 3),
      new Car(Engine.road.getLaneCenter(2), -200, 30, 50, 'dummy', 2),
      new Car(Engine.road.getLaneCenter(1), -50, 30, 50, 'dummy', 1),
    ];

    const controllers = document.createElement('div');
    controllers.classList.add('controllers');

    const label = document.createElement('label');
    label.setAttribute('for', 'fileInput');
    label.classList.add('file-input-label');
    label.innerHTML = '📁';

    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('id', 'fileInput');
    fileInput.setAttribute('accept', '.world');

    label.appendChild(fileInput);

    controllers.appendChild(label);

    const buttons = [
      Utils.createButton('🗑️'),
      Utils.createButton('💾'),
      Utils.createButton('🌎'),
      Utils.createButton('🛑'),
      Utils.createButton('🚶'),
      Utils.createButton('🚗'),
      Utils.createButton('🅿️'),
      Utils.createButton('🚦'),
      Utils.createButton('🎯'),
      Utils.createButton('⚠️'),
    ];

    const [
      disposeButton,
      saveButton,
      graphModeButton,
      stopModeButton,
      crossingModeButton,
      startModeButton,
      parkingModeButton,
      lightModeButton,
      targetModeButton,
      yieldModeButton,
    ] = buttons;

    for (const button of buttons) {
      controllers.appendChild(button);
    }

    container.appendChild(canvas);
    container.appendChild(visualizer);
    app.appendChild(container);
    app.appendChild(controllers);

    canvas.width = window.innerWidth / 2 + 100;
    canvas.height = 800;
    visualizer.width = 400;
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

    const tools: IEngine.ITools = {
      graph: {
        button: graphModeButton,
        editor: new GraphEditor(viewport, graph),
      },
      stop: {
        button: stopModeButton,
        editor: new StopEditor(viewport, world),
      },
      crossing: {
        button: crossingModeButton,
        editor: new CrossingEditor(viewport, world),
      },
      start: {
        button: startModeButton,
        editor: new StartEditor(viewport, world),
      },
      parking: {
        button: parkingModeButton,
        editor: new ParkingEditor(viewport, world),
      },
      light: {
        button: lightModeButton,
        editor: new LightEditor(viewport, world),
      },
      target: {
        button: targetModeButton,
        editor: new TargetEditor(viewport, world),
      },
      yield: {
        button: yieldModeButton,
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

    fileInput.addEventListener('change', (event: Event): void => {
      const file: File | undefined = (event.target as HTMLInputElement)?.files?.[0];

      if (!file) {
        alert('No file selected.');
        return;
      }

      const reader: FileReader = new FileReader();
      reader.readAsText(file);

      reader.onload = (event: ProgressEvent<FileReader>): void => {
        const fileContent: string = event.target?.result as string;
        const jsonData = JSON.parse(fileContent);
        world = World.load(jsonData);
        localStorage.setItem('world', JSON.stringify(world));
        location.reload();
      };
    });

    disposeButton.addEventListener('click', (): void => {
      (tools.graph.editor as GraphEditor).dispose();
      world.markings = [];
      localStorage.removeItem('world');
    });

    saveButton.addEventListener('click', (): void => {
      world.zoom = viewport.zoom;
      world.offset = viewport.offset;

      const element: HTMLAnchorElement = document.createElement('a');
      element.setAttribute(
        'href',
        'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(world)),
      );

      const filename: string = 'name.world';
      element.setAttribute('download', filename);
      element.click();

      localStorage.setItem('world', JSON.stringify(world));
    });

    for (const [mode, tool] of Object.entries(tools) as [keyof IEngine.ITools, IEngine.ITool][]) {
      tool.button.addEventListener('click', (): void => {
        setEditorMode(mode);
      });
    }
  }

  public static animate(time: number): void {
    const { graph, tools, viewport, context, world, visualizerContext, car, road, traffic } =
      Engine;

    viewport.reset();

    if (graph.hash() !== Engine.oldGraphHash) {
      world.generate();
      Engine.oldGraphHash = graph.hash();
    }

    const viewPoint: Point = Utils.scale(viewport.getOffset(), -1);
    world.draw({ context, viewPoint });

    context.globalAlpha = 0.3;

    for (const tool of Object.values(tools) as IEngine.ITool[]) {
      tool.editor.display();
    }

    for (let i = 0; i < traffic.length; i++) {
      traffic[i].update(road.borders, []);
    }

    car.update(road.borders, traffic);
    context.save();
    context.translate(0, -car.y);

    road.draw({ context });
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw({ context, color: 'red' });
    }
    car.draw({ context, color: 'blue' });

    context.restore();

    visualizerContext.clearRect(
      0,
      0,
      visualizerContext.canvas.width,
      visualizerContext.canvas.height,
    );
    visualizerContext.save();
    visualizerContext.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(visualizerContext, car.brain);
    visualizerContext.restore();

    requestAnimationFrame(Engine.animate);
  }
}
