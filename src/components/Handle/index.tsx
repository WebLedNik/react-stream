import * as React from 'react'
import {useEffect, useMemo, useRef} from 'react'
import cc from "classcat"
import './style.css'
import {v4 as uuidv4} from 'uuid';
import {select} from "d3-selection";
import {FlowchartEditorState, useStore} from "../../store";
import {Line, LineStateNames} from "../Line";
import {NodeState} from "../Node";
import {getRelativePosition, getRootElement} from "../../utils";
import {Directions} from "../../types";
import {HandleTypeNames} from "./types";

interface HandleProps {
  type: HandleTypeNames
  node: NodeState
  direction: Directions
}

const Handle: React.FC<HandleProps> = (props) => {
  const {node, direction, type} = props
  const handleRef = useRef<HTMLDivElement>(null)
  const {zoomTransformState, lines, setLines, updateLines}: FlowchartEditorState = useStore((state) => state)
  const handleId = useMemo(() => uuidv4(), [])

  const handleMouseDown = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (!event.target) return;
    if (type !== HandleTypeNames.Output) return;

    const eventTarget = (event.target as HTMLDivElement).dataset.id ? (event.target as HTMLDivElement) : ((event.target as HTMLDivElement).closest(`[data-id='${handleId}']`) as HTMLDivElement)
    const parent = window.document.querySelector(`[data-id='${node.id}']`);
    if (!parent || !eventTarget) return

    const handleRelativePos = getRelativePosition({parent: parent as HTMLDivElement, child: eventTarget})

    const x = node.position.x + (eventTarget.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k)
    const y = node.position.y + (eventTarget.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)

    setLines([Line.getDTO({handle: {id: handleId, type, direction}, position: {x,y}})])
  }
  const handleMouseUp = (event: MouseEvent) => {
    event.preventDefault()

    if (!event.target) return;
    if (type === HandleTypeNames.Output) return;

    const eventTarget = (event.target as HTMLDivElement).dataset.id ? (event.target as HTMLDivElement) : ((event.target as HTMLDivElement).closest(`[data-id='${handleId}']`) as HTMLDivElement)
    const parent = window.document.querySelector(`[data-id='${node.id}']`);
    if (!parent || !eventTarget) return

    const handleRelativePos = getRelativePosition({parent: parent as HTMLDivElement, child: eventTarget})

    const x = node.position.x + (eventTarget.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k)
    const y = node.position.y + (eventTarget.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)

    const line = lines.find(l => l.state === LineStateNames.Created)
    if (!line) return;

    line.setTarget({handle: {id: handleId, type, direction}, position: {x,y}})
    updateLines([line])
  }

  useEffect(() => {
    const selection = select(handleRef.current)

    selection.on('mousedown', handleMouseDown)
    selection.on('mouseup', handleMouseUp)
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
  >
    </div>
  )
}

Handle.displayName = 'FlowchartHandle'
export default Handle
export * from './types'
export * from './utils'
