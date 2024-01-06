import { Graph } from '../math/graph.ts';
import type { Point } from '../primitives/point.ts';
import { GraphEditor } from './graph-editor.ts';
import { Utils } from './utils.ts';
import { Viewport } from './viewport.ts';
import { World } from './world.ts';

export class Engine {
  public static canvas: HTMLCanvasElement;
  public static context: CanvasRenderingContext2D;
  public static graph: Graph;
  public static graphEditor: GraphEditor;
  public static viewport: Viewport;
  public static world: World;
  public static oldGraphHash: string;

  public static start() {
    const app = document.querySelector('#app')! as HTMLDivElement;

    const canvas = document.createElement('canvas');
    Engine.canvas = canvas;

    const controllers = document.createElement('div');

    const disposeButton = document.createElement('button');
    disposeButton.innerHTML = '🗑️';

    const saveButton = document.createElement('button');
    saveButton.innerHTML = '💾';

    controllers.appendChild(disposeButton);
    controllers.appendChild(saveButton);

    app.appendChild(canvas);
    app.appendChild(controllers);

    canvas.width = 600;
    canvas.height = 600;

    Engine.context = canvas.getContext('2d')!;

    const graphString = localStorage.getItem('graph');
    const graphInfo: Graph | null = graphString ? JSON.parse(graphString) : null;

    const graph = graphInfo ? Graph.load(graphInfo) : new Graph();
    Engine.graph = graph;

    const world = new World(graph);
    Engine.world = world;

    const viewport = new Viewport(canvas);
    Engine.viewport = viewport;

    const graphEditor = new GraphEditor(viewport, graph);
    Engine.graphEditor = graphEditor;

    Engine.oldGraphHash = graph.hash();
    Engine.animate();

    disposeButton.addEventListener('click', (): void => {
      graphEditor.dispose();
    });

    saveButton.addEventListener('click', (): void => {
      localStorage.setItem('graph', JSON.stringify(graph));
    });
  }

  public static animate() {
    const { graph, graphEditor, viewport, context, world } = Engine;

    viewport.reset();

    if (graph.hash() !== Engine.oldGraphHash) {
      world.generate();
      Engine.oldGraphHash = graph.hash();
    }

    const viewPoint: Point = Utils.scale(viewport.getOffset(), -1);
    world.draw({ context, viewPoint });

    context.globalAlpha = 0.3;
    graphEditor.display();
    requestAnimationFrame(Engine.animate);
  }
}
