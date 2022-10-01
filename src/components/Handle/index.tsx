import * as React from 'react'
import {useEffect, useMemo, useRef} from 'react'
import cc from "classcat"
import './style.css'
import {v4 as uuidv4} from 'uuid';
import {select} from "d3-selection";
import {FlowchartEditorState, useStore} from "../../store";
import {LineDTO, LineState} from "../Line";
import {NodeState} from "../Node";
import {getRelativePosition} from "../../utils";
import {Directions} from "../../types";
import {HandleTypeNames} from "./types";

interface HandleProps {
  type: HandleTypeNames
  node: NodeState
  direction: Directions
}

const Handle: React.FC<HandleProps> = (props) => {
  const {node, direction, type} = props
  const handleRef = useRef(null)
  const {zoomTransformState, lines, setLines, updateLines}: FlowchartEditorState = useStore((state) => state)
  const handleId = useMemo(() => uuidv4(), [])

  useEffect(() => {
    const selection = select(handleRef.current)

    selection.on('mousedown', (event) => {
      event.stopPropagation();
      event.preventDefault()

      if (type !== HandleTypeNames.Output) return;

      const parent = window.document.querySelectorAll(`[data-id='${node.id}']`)[0];
      if (!parent) return

      const handleRelativePos = getRelativePosition({parent: parent as HTMLDivElement, child: event.target})

      const x = node.position.x + (event.target.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k)
      const y = node.position.y + (event.target.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)

      const payload: LineDTO = {
        source: {handle: {id: handleId, type, direction}, position: {x, y}},
        target: {position: {x, y}},
        creating: true
      }

      setLines([payload])
    })

    selection.on('mouseover', (event) => {
      event.stopPropagation();
      event.preventDefault()

      if (type !== HandleTypeNames.Input) return;

      const parent = window.document.querySelectorAll(`[data-id='${node.id}']`)[0];
      if (!parent) return

      const handleRelativePos = getRelativePosition({parent: parent as HTMLDivElement, child: event.target})

      const x = node.position.x + (event.target.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k)
      const y = node.position.y + (event.target.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)

      const creatingLine = lines.find(l => l.creating)

      if (creatingLine) {
        const payload: LineState = {
          ...creatingLine,
          target: {...creatingLine.target, handle: {id: handleId, type, direction}, position: {x, y}}
        }

        updateLines([payload])
      }

      console.log('Handle mouseup', {x, y, creatingLine, handleId})
    })
  }, [node, lines, zoomTransformState])

  return (
    <div
    className={cc([
      'flowchart-editor_handle',
      {
        ['_top']: direction === Directions.Top,
        ['_right']: direction === Directions.Right,
        ['_left']: direction === Directions.Left,
        ['_bottom']: direction === Directions.Bottom,
        ['_input']: type === HandleTypeNames.Input,
        ['_output']: type === HandleTypeNames.Output
      }
    ])}
    ref={handleRef}
    data-id={handleId}
    data-parent={node.id}
    data-handle-type={type}
    data-direction={direction}
  />
  )
}

Handle.displayName = 'Handle'
export default Handle
