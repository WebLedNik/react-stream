import * as React from "react";
import './style.css'
import {LineState} from "./types";
import {useEffect, useRef, useState} from "react";
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import cc from 'classcat'
import {getDirectionCursor} from "../../utils";

interface LineProps {
  line: LineState
}

const Line: React.FC<LineProps> = (props) => {
  const {line} = props
  const pathRef = useRef(null)
  const handleLineTargetRef = useRef(null)
  const {zoomTransformState, updateLines}: FlowchartEditorState = useStore((state) => state)

  const [mouseMovePosition, setMouseMovePosition] = useState<LineState['target']['position'] | null>(null)

  const moveToPosition: LineState['target']['position'] = {x: line.source.position.x, y: line.source.position.y}
  const lineToPosition: LineState['target']['position'] = {
    x: mouseMovePosition?.x ?? line.target.position.x,
    y: mouseMovePosition?.y ?? line.target.position.y
  }

  const handleMouseUp = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (!line.transforming) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    const payload: LineState = {
      ...line,
      transforming: false,
      target: {position: {x, y}}
    }

    setMouseMovePosition(null)
    updateLines([payload])
  }
  const handleMouseMove = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    const MARGIN = 20
    const rootElement = window.document.querySelectorAll(`[data-id='${line.source.id}']`)[0]
    const rootX = line.target.position.x - MARGIN
    const rootY = line.target.position.y - MARGIN

    console.log(getDirectionCursor({clientX: event.clientX, clientY: event.clientY, rootX, rootY}))

    if (!line.transforming) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    setMouseMovePosition({x, y})
  }

  useEffect(() => {
    const selectionLine = select(pathRef.current)
    const selectionHandleLineTarget = select(handleLineTargetRef.current)

    selectionLine.on('click', (event) => {
      const payload: LineState = {
        ...line,
        selected: true
      }

      updateLines([payload])
    })
    selectionHandleLineTarget.on('mousedown', (event) => {
      event.stopPropagation();
      event.preventDefault()

      const payload: LineState = {
        ...line,
        transforming: true
      }

      updateLines([payload])
    })

    window.document.addEventListener('mouseup', handleMouseUp, {once: true})
  }, [line, zoomTransformState])

  window.document.getElementsByClassName('flowchart-editor')[0]?.addEventListener('mousemove', handleMouseMove, {once: true})

  return (
    <g className={'flowchart-editor_line'}>
      {!Boolean(line.source.id) &&
        <circle className={'flowchart-editor_handle-line'} cx={moveToPosition.x} cy={moveToPosition.y} r={12}/>}
      <path
        ref={pathRef}
        className={cc([
          'flowchart-editor_line-path',
          {
            ['_selected']: line.selected
          }
        ])}
        d={`M ${moveToPosition.x} ${moveToPosition.y} L ${lineToPosition.x} ${lineToPosition.y}`}
        markerEnd={'url(#handle-line-target)'}
      />
      {!Boolean(line.target.id) &&
        <circle ref={handleLineTargetRef} className={'flowchart-editor_handle-line'} cx={lineToPosition.x}
                cy={lineToPosition.y} r={12}/>}
    </g>
  )
}

Line.displayName = 'Line'
export default Line
export * from './types'
export * from './utils'