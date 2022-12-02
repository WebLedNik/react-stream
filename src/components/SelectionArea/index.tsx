import * as React from 'react'
import Selecto from "react-selecto";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";
import {NodeState, NodeStateNames} from "../Node";
import {LineStateNames, setLineState} from "../Line";
import {useEffect, useMemo, useRef, useState} from "react";
import useEventListener from "../../hooks/useEventListener";

interface SelectionAreaProps {
  container?: HTMLElement | null
  dragContainer?: HTMLElement | null
  selectableTargets?: Array<string>
}

const SelectionArea: React.FC<SelectionAreaProps> = (props) => {
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

  const [container, setContainer] = useState<HTMLElement>(document.body)
  const [dragContainer, setDragContainer] = useState<HTMLElement>(document.body)

  const selectableTargets = useMemo<Array<string>>(() => props.selectableTargets ?? [".flowchart-editor_node", ".flowchart-editor_line"], [props.selectableTargets])

  const handleContainerClick = (event: MouseEvent) => {
    event.preventDefault()

    const LEFT_MOUSE_BTN = 0
    const IS_SHIFT_BTN = event.shiftKey

    if (IS_SHIFT_BTN) return
    // Сброс выделенных объектов
    if (event.button === LEFT_MOUSE_BTN) {
      updateNodes(nodes.map(n => ({...n, state: NodeStateNames.Fixed})))
      updateLines(lines.map(l => setLineState({line: l, state: LineStateNames.Fixed})))
    }
  }

  useEventListener("click", handleContainerClick, container)
  useEffect(() => {
    setContainer(props.container ?? document.querySelector(".flowchart-editor_zoom-pane") as HTMLElement ?? document.body)
    setDragContainer(props.dragContainer ?? document.querySelector(".flowchart-editor_zoom-pane") as HTMLElement ?? document.body)
  }, [props.container, props.dragContainer])

  return (
    <></>
  )
}

SelectionArea.displayName = 'FlowchartSelectionArea'
export default SelectionArea