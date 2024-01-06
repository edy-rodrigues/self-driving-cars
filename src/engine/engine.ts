import { Graph } from '../math/graph.ts';
import { Point } from '../primitives/point.ts';
import { Segment } from '../primitives/segment.ts';
import { GraphEditor } from './graph-editor.ts';
import { Viewport } from './viewport.ts';

export class Engine {
  public static canvas: HTMLCanvasElement;
  public static context: CanvasRenderingContext2D;
  public static graph: Graph;
  public static graphEditor: GraphEditor;
  public static viewport: Viewport;

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

    const viewport = new Viewport(canvas);
    Engine.viewport = viewport;

    const graphEditor = new GraphEditor(viewport, graph);
    Engine.graphEditor = graphEditor;

    Engine.animate();

    disposeButton.addEventListener('click', (): void => {
      graphEditor.dispose();
    });

    saveButton.addEventListener('click', (): void => {
      localStorage.setItem('graph', JSON.stringify(graph));
    });
  }

  public static animate() {
    const { graphEditor, viewport } = Engine;

    viewport.reset();
    graphEditor.display();
    requestAnimationFrame(Engine.animate);
  }
}
