import * as React from 'react'
import {useEffect, useMemo, useRef} from 'react'
import './style.css'
import {v4 as uuidv4} from 'uuid';
import {select} from "d3-selection";
import {FlowchartEditorState, useStore} from "../../store";
import {LineDTO, Path, PathDTO} from "../Line";
import {NodeState} from "../Node";
import {getRelativePosition} from "../../utils";
import {Directions} from "../../types";

interface HandleProps{
  node: NodeState
}
const Handle: React.FC<HandleProps> = (props) => {
  const {node} = props
  const handleRef = useRef(null)
  const {zoomTransformState, setLines}: FlowchartEditorState = useStore((state) => state)
  const handleId = useMemo(() => uuidv4(), [])

  useEffect(() => {
    const selection = select(handleRef.current)

    selection.on('mousedown', (event) => {
      event.stopPropagation();
      event.preventDefault()

      const parent = window.document.querySelectorAll(`[data-id='${node.id}']`)[0];
      if (!parent) return

      const handleRelativePos = getRelativePosition({parent: parent as HTMLDivElement, child: event.target})

      const x = node.position.x + (event.target.clientWidth / 2) +  (handleRelativePos.x / zoomTransformState.k)
      const y = node.position.y + (event.target.clientHeight / 2) +  (handleRelativePos.y / zoomTransformState.k)

      const path = new Path({
        direction: Directions.Right,
        moveTo: {x,y},
        lineTo: {x, y}
      })
      const payload: LineDTO = {
        source: {id: handleId, position: {x,y}},
        target: {position: {x,y}},
        transforming: true,
        paths: [path]
      }

      setLines([payload])
    })
  }, [node, zoomTransformState])

  return <div className={'flowchart-editor_handle'} ref={handleRef} data-id={handleId} data-parent={node.id}/>
}

Handle.displayName = 'Handle'
export default Handle
