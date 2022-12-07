import * as React from 'react'
import Selecto from "react-selecto";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";
import {NodeState, NodeStateNames} from "../Node";
import {LineState, LineStateNames, setLineState} from "../Line";
import {useEffect, useMemo, useRef, useState} from "react";
import useEventListener from "../../hooks/useEventListener";

interface SelectionAreaProps {
  container?: HTMLElement | null
  dragContainer?: HTMLElement | null
  selectableTargets?: Array<string>
  onNodesChange?:(nodes: NodeState[]) => void
  onLinesChange?:(lines: LineState[], isCreate?: boolean) => void
}

const SelectionArea: React.FC<SelectionAreaProps> = (props) => {
  const {
    onNodesChange,
    onLinesChange
  } = props
  const {
    nodes,
    lines
  } = useStore((state: FlowchartEditorState) => ({
    nodes: state.nodes,
    lines: state.lines,
  }), shallow)

  const [container, setContainer] = useState<HTMLElement>(document.body)
  const [dragContainer, setDragContainer] = useState<HTMLElement>(document.body)

  const selectableTargets = useMemo<Array<string>>(() => props.selectableTargets ?? [".flowchart-editor_node", ".flowchart-editor_line"], [props.selectableTargets])

  const handleContainerClick = (event: MouseEvent) => {
    event.preventDefault()

    const target = event.target as HTMLElement
    if (!target) return;

    const LEFT_MOUSE_BTN = 0
    const IS_SHIFT_BTN = event.shiftKey

    if (IS_SHIFT_BTN) return
    // Сброс выделенных объектов
    if (event.button === LEFT_MOUSE_BTN) {
      onNodesChange && onNodesChange(nodes.map(n => ({...n, state: NodeStateNames.Fixed})))
      onLinesChange && onLinesChange(lines.map(l => setLineState({line: l, state: LineStateNames.Fixed})))
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