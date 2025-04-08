import type { GraphEditor } from '../editors/graph-editor.ts';
import { Osm } from '../math/osm.ts';
import { Engine } from './engine.ts';
import { Utils } from './utils.ts';
import { World } from './world.ts';

export class Controllers {
  public static ToolsButtons: {
    graph: HTMLButtonElement;
    stop: HTMLButtonElement;
    crossing: HTMLButtonElement;
    start: HTMLButtonElement;
    parking: HTMLButtonElement;
    light: HTMLButtonElement;
    target: HTMLButtonElement;
    yield: HTMLButtonElement;
  };
  public static fileInput: HTMLInputElement;

  public static draw(element: HTMLElement) {
    const controllers: HTMLDivElement = document.createElement('div');
    controllers.classList.add('controllers');

    Controllers.drawAIButtons(controllers);
    Controllers.drawFileInput(controllers);
    Controllers.drawEditorButtons(controllers);

    element.appendChild(controllers);
  }

  private static drawEditorButtons(container: HTMLDivElement): void {
    const buttons = [
      Utils.createButton('🗺️'),
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
      openStreetMapButton,
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

    Controllers.ToolsButtons = {
      graph: graphModeButton,
      stop: stopModeButton,
      crossing: crossingModeButton,
      start: startModeButton,
      parking: parkingModeButton,
      light: lightModeButton,
      target: targetModeButton,
      yield: yieldModeButton,
    };

    openStreetMapButton.addEventListener('click', (): void => {
      Controllers.drawOpenStreetMapModal(container.parentElement!);
    });

    disposeButton.addEventListener('click', (): void => {
      (Engine.tools.graph.editor as GraphEditor).dispose();
      Engine.world.markings = [];
      localStorage.removeItem('world');
    });

    saveButton.addEventListener('click', (): void => {
      Engine.world.zoom = Engine.viewport.zoom;
      Engine.world.offset = Engine.viewport.offset;

      const element: HTMLAnchorElement = document.createElement('a');
      console.log(Engine.world);
      element.setAttribute(
        'href',
        'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(Engine.world)),
      );

      const filename: string = 'name.world';
      element.setAttribute('download', filename);
      element.click();

      localStorage.setItem('world', JSON.stringify(Engine.world));
    });

    for (const button of buttons) {
      container.appendChild(button);
    }
  }

  private static drawAIButtons(container: HTMLDivElement): void {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('ai-buttons-container');

    const buttons = [Utils.createButton('🗑️'), Utils.createButton('💾')];
    const [disposeBrainButton, saveBrainButton] = buttons;

    disposeBrainButton.addEventListener('click', Engine.discardBestBrain);
    saveBrainButton.addEventListener('click', Engine.saveBestBrain);

    for (const button of buttons) {
      buttonContainer.appendChild(button);
    }

    container.appendChild(buttonContainer);
  }

  private static drawFileInput(container: HTMLDivElement): void {
    const label = document.createElement('label');
    label.setAttribute('for', 'fileInput');
    label.classList.add('file-input-label');
    label.innerHTML = '📁';

    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('id', 'fileInput');
    fileInput.setAttribute('accept', '.world');

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
        Engine.world = World.load(jsonData);
        localStorage.setItem('world', JSON.stringify(Engine.world));
        location.reload();
      };
    });

    label.appendChild(fileInput);

    container.appendChild(label);
  }

  private static drawOpenStreetMapModal(container: HTMLElement): void {
    const overlay: HTMLDivElement = document.createElement('div');
    overlay.setAttribute('id', 'overlay');
    const modal: HTMLDialogElement = document.createElement('dialog');
    modal.classList.add('modal');
    const title = document.createElement('span');
    title.classList.add('modal-title');
    title.innerHTML = 'Open Street Map Import';

    const textarea: HTMLTextAreaElement = document.createElement('textarea');
    textarea.setAttribute('rows', '7');
    textarea.setAttribute('cols', '50');
    textarea.setAttribute('placeholder', 'Past OSM data here');

    const actionsContainer: HTMLDivElement = document.createElement('div');
    actionsContainer.classList.add('modal-actions-container');
    const buttons: HTMLButtonElement[] = [Utils.createButton('❌'), Utils.createButton('✔️')];
    const [closeButton, confirmButton] = buttons;

    for (const button of buttons) {
      actionsContainer.appendChild(button);
    }

    modal.appendChild(title);
    modal.appendChild(textarea);
    modal.appendChild(actionsContainer);

    container.appendChild(overlay);
    container.appendChild(modal);

    closeButton.addEventListener('click', (): void => {
      container.removeChild(overlay);
      container.removeChild(modal);
    });

    confirmButton.addEventListener('click', (): void => {
      if (textarea.value === '') {
        alert('Paste data first!');
        return;
      }

      Osm.parseRoads(JSON.parse(textarea.value));

      container.removeChild(overlay);
      container.removeChild(modal);
    });
  }
}
