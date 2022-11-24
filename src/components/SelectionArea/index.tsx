import * as React from 'react'
import './style.css'
import Selecto from "react-selecto";

interface SelectionAreaProps{}

const SelectionArea: React.FC<SelectionAreaProps> = (props) => {
  const {} = props
  return(
    <Selecto
      // The container to add a selection element
      container={document.querySelector(".flowchart-editor") as HTMLElement}
      // The area to drag selection element (default: container)
      dragContainer={document.querySelector(".flowchart-editor") as HTMLElement}
      // Targets to select. You can register a queryselector or an Element.
      selectableTargets={[
        ".flowchart-editor_node",
        document.querySelector(".flowchart-editor_node") as HTMLElement,
        // ".flowchart-editor_line",
        // document.querySelector(".flowchart-editor_line"),
        // ".flowchart-editor_line-path",
        // document.querySelector(".flowchart-editor_line-path"),
      ]}
      // Whether to select by click (default: true)
      selectByClick={true}
      // Whether to select from the target inside (default: true)
      selectFromInside={true}
      // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
      continueSelect={false}
      // Determines which key to continue selecting the next target via keydown and keyup.
      toggleContinueSelect={"shift"}
      // The container for keydown and keyup events
      keyContainer={window}
      // The rate at which the target overlaps the drag area to be selected. (default: 100)
      hitRate={100}
      onSelect={e => {

        e.added.forEach(el => {
          el.classList.add("selected");
        });
        e.removed.forEach(el => {
          el.classList.remove("selected");
        });
      }}
    />
  )
}

SelectionArea.displayName = 'FlowchartSelectionArea'
export default SelectionArea