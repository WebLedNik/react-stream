import * as React from 'react'
import Selecto from "react-selecto";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";
import {NodeState, NodeStateNames} from "../Node";
import {LineStateNames} from "../Line";

interface SelectionAreaProps{}

const SelectionArea: React.FC<SelectionAreaProps> = (props) => {
  const {} = props
  const {
    nodes,
    lines,
    updateNodes,
    updateLines
  } = useStore((state: FlowchartEditorState) => ({
    nodes: state.nodes,
    lines: state.lines,
    updateNodes: state.updateNodes,
    updateLines: state.updateLines
  }), shallow)

  return(
    <Selecto
      rootContainer={document.querySelector(".flowchart-editor_zoom-pane") as HTMLElement}
      // The container to add a selection element
      container={document.querySelector(".flowchart-editor_zoom-pane") as HTMLElement}
      // The area to drag selection element (default: container)
      dragContainer={document.querySelector(".flowchart-editor_zoom-pane") as HTMLElement}
      // Targets to select. You can register a queryselector or an Element.
      selectableTargets={[
        ".flowchart-editor_node",
        ".flowchart-editor_line",
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
      onSelect={({added, removed, selected}) => {
        added.forEach(el => {
          el.classList.add("_selected");
        });
        removed.forEach(el => {
          el.classList.remove("_selected");
        });
      }}
      onSelectEnd={({selected,removed,added}) => {
        const payloadAddNodes = added.map(el => nodes.find(n => n.id === el.dataset.id)).filter(n => Boolean(n)).map(n => ({...n, state: NodeStateNames.Selected}))
        const payloadAddLines = added.map(el => lines.find(l => l.id === el.dataset.id)).filter(l => Boolean(l)).map(l => ({...l, state: LineStateNames.Selected}))
        const payloadRemoveNodes = removed.map(el => nodes.find(n => n.id === el.dataset.id)).filter(n => Boolean(n)).map(n => ({...n, state: NodeStateNames.Fixed}))
        const payloadRemoveLines = removed.map(el => lines.find(l => l.id === el.dataset.id)).filter(l => Boolean(l)).map(l => ({...l, state: LineStateNames.Fixed}))
        // @ts-ignore
        updateNodes([...payloadAddNodes, ...payloadRemoveNodes])
        // @ts-ignore
        updateNodes([...payloadAddLines, ...payloadRemoveLines])
      }}

    />
  )
}

SelectionArea.displayName = 'FlowchartSelectionArea'
export default SelectionArea