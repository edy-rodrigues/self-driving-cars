import './style.css'
import { Graph } from './math/graph.ts';
import { Point } from './primitives/point.ts';
import { Segment } from './primitives/segment.ts';

const app = document.querySelector('#app')! as HTMLDivElement;

const canvas = document.createElement('canvas');
const controller = document.createElement('div');

const addPointButton = document.createElement('button');
addPointButton.innerHTML = 'Add Point';

const removePointButton = document.createElement('button');
removePointButton.innerHTML = 'Remove Point';

const addSegmentButton = document.createElement('button');
addSegmentButton.innerHTML = 'Add Segment';

const removeSegmentButton = document.createElement('button');
removeSegmentButton.innerHTML = 'Remove Segment';

const resetGameButton = document.createElement('button');
resetGameButton.innerHTML = 'Reset game';

controller.appendChild(addPointButton);
controller.appendChild(removePointButton);
controller.appendChild(addSegmentButton);
controller.appendChild(removeSegmentButton);
controller.appendChild(resetGameButton);

app.appendChild(canvas);
app.appendChild(controller);

canvas.width = 600;
canvas.height = 600;

const context = canvas.getContext('2d')!;

const p1 = new Point(200, 200);
const p2 = new Point(500, 200);
const p3 = new Point(400, 400);
const p4 = new Point(100, 300);

const s1 = new Segment(p1, p2);
const s2 = new Segment(p1, p3);
const s3 = new Segment(p1, p4);
const s4 = new Segment(p2, p3);

const graph = new Graph([p1, p2, p3, p4], [s1, s2, s3, s4]);
graph.draw(context);

// Listeners
addPointButton.addEventListener('click', (): void => {
  const success = graph.tryAddPoint(
    new Point(
    Math.random() * canvas.width, Math.random() * canvas.height
    )
  );

  context.clearRect(0, 0, canvas.width, canvas.height);
  graph.draw(context);

  console.log(success);
});

removePointButton.addEventListener('click', (): void => {
  if (graph.points.length === 0) {
    console.log('No Points');
    return;
  }

  const index = Math.floor(Math.random() * graph.points.length);
  graph.removePoint(graph.points[index]);

  context.clearRect(0, 0, canvas.width, canvas.height);
  graph.draw(context);
});

addSegmentButton.addEventListener('click', (): void => {
  const index1 = Math.floor(Math.random() * graph.points.length);
  const index2 = Math.floor(Math.random() * graph.points.length);

  const success = graph.tryAddSegment(new Segment(graph.points[index1], graph.points[index2]));

  context.clearRect(0, 0, canvas.width, canvas.height);
  graph.draw(context);
  console.log(success);
});

removeSegmentButton.addEventListener("click", (): void => {
  if (graph.segments.length === 0) {
    console.log('No segments');
    return;
  }

  const index = Math.floor(Math.random() * graph.segments.length);
  graph.removeSegment(graph.segments[index]);

  context.clearRect(0, 0, canvas.width, canvas.height);
  graph.draw(context);
});

resetGameButton.addEventListener('click', (): void => {
  graph.dispose();

  context.clearRect(0, 0, canvas.width, canvas.height);
  graph.draw(context);
});


