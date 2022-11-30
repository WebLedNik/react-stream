import Selecto from "selecto";

const selecto = new Selecto({
  // The container to add a selection element
  container: document.querySelector(".flowchart-editor_zoom-pane") as HTMLElement,
  // Selecto's root container (No transformed container. (default: null)
  rootContainer: document.querySelector(".flowchart-editor_zoom-pane") as HTMLElement,
  // The area to drag selection element (default: container)
  dragContainer: document.querySelector(".flowchart-editor_zoom-pane") as HTMLElement,
  // Targets to select. You can register a queryselector or an Element.
  selectableTargets: [ ".flowchart-editor_line"],
  // Whether to select by click (default: true)
  selectByClick: true,
  // Whether to select from the target inside (default: true)
  selectFromInside: true,
  // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
  continueSelect: false,
  // Determines which key to continue selecting the next target via keydown and keyup.
  toggleContinueSelect: "shift",
  // The container for keydown and keyup events
  keyContainer: window,
  // The rate at which the target overlaps the drag area to be selected. (default: 100)
  hitRate: 100,
});

selecto.on("select", e => {
  e.added.forEach(el => {
    el.classList.add("_selected");
  });
  e.removed.forEach(el => {
    el.classList.remove("_selected");
  });

  console.log('onSelect', {selected: e.selected, e})
});