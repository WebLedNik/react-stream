import * as React from 'react'
import {useEffect, useState} from "react";
import {useEventListener} from "../../hooks";
import {VALUE_BACK_SPACE, VALUE_DELETE} from "../../types";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";
import {NodeState, NodeStateNames} from "../Node";
import {LineState, LineStateNames} from "../Line";

interface KeyManagementProps {
  onNodesDelete?: (nodes: NodeState[]) => void
  onLinesDelete?: (nodes: LineState[]) => void
}

const KeyManagement: React.FC<KeyManagementProps> = (props) => {
  const {
    onNodesDelete,
    onLinesDelete
  } = props
  const {
    nodes,
    lines,
  } = useStore((state: FlowchartEditorState) => ({
    nodes: state.nodes,
    lines: state.lines
  }), shallow)

  const [container, setContainer] = useState<HTMLElement>(document.body)

  const handleKeyDown = (event: KeyboardEvent) => {
    event.preventDefault()

    if (
      event.key === VALUE_DELETE ||
      event.key === VALUE_BACK_SPACE
    ) {
      const deleteableNodes = nodes.filter(n => n.state === NodeStateNames.Selected)
      const deleteableLines = lines.filter(l => l.state === LineStateNames.Selected)
      console.log({deleteableLines})
      onNodesDelete && onNodesDelete(deleteableNodes)
      onLinesDelete && onLinesDelete(deleteableLines)
    }
  }

  useEventListener("keydown", handleKeyDown, container)

  useEffect(() => {
    setContainer(document.body)
  }, [])

  return (
    <></>
  )
}

export default KeyManagement