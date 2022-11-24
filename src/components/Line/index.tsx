import * as React from "react";
import {useEffect, useRef} from "react";
import './style.css'
import {LineState, LineStateNames, Part, PartStateNames} from "./types";
import {select} from "d3-selection";
import Path from "./Path";
import {getRootElement} from "../../utils";
import TextPath from "./TextPath";
import {isEqual, once} from "lodash";
import {ZoomTransform} from "d3-zoom";
import {
  getIsLineModified,
  getLineTargetPosition,
  getMarkerType,
  setLinePart,
  setLineState,
  setLineStatePart,
  setLineTransform
} from "./utils";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";

interface ContentProps {
  line: LineState
}

const Line: React.FC<ContentProps> = (props) => {
  const {line} = props
  const {updateLines, zoomTransformState} = useStore((state: FlowchartEditorState) => ({zoomTransformState: state.zoomTransformState, updateLines: state.updateLines}), shallow)

  const handleLineTargetRef = useRef(null)

  const handleMouseUp = (event: MouseEvent) => {
    console.log('handleMouseUp', {line})
    event.stopPropagation()
    event.preventDefault()

    getRootElement().removeEventListener('mousemove', handleMouseMove)

    if (!getIsLineModified(line.state)) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    const payload = setLineTransform({line, position: {x, y}})
    updateLines([payload])

    return;
  }

  const handleMouseMove = (event: MouseEvent) => {
    console.log('handleMouseMove')
    event.stopPropagation()
    event.preventDefault()

    if (!getIsLineModified(line.state)) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    const payload = setLinePart({currentLine: line, position: {x, y}})
    payload && updateLines([payload])
    return;
  }

  const handleMouseDown = (event: MouseEvent) => {
    console.log('handleMouseDown')
    event.stopPropagation();
    event.preventDefault()

    const payload = setLineState({line, state: LineStateNames.Created})
    updateLines([payload])
    //
    // getRootElement().addEventListener('mousemove', handleMouseMove)
    // getRootElement().addEventListener('mouseup', handleMouseUp, {once: true})
  }

  const handleMouseClick = (event: MouseEvent) => {
  }

  const handlePathClick = (event: React.MouseEvent | MouseEvent) => {
  }

  const handlePathMouseDown = (event: MouseEvent, part: Part) => {
    const payloadLine = setLineState({line, state: LineStateNames.Updated})
    const payloadParts = setLineStatePart({parts: payloadLine.parts, part, state: PartStateNames.Updated})

    updateLines([{...payloadLine, parts: payloadParts}])
    return
  }

  const handleMouseEnter = (event: MouseEvent, part: Part) => {
  }

  const handleMouseLeave = (event: MouseEvent, part: Part) => {
  }

  useEffect(() => {
    const selectionHandleLineTarget = select(handleLineTargetRef.current)

    selectionHandleLineTarget.on('mousedown', handleMouseDown)
    selectionHandleLineTarget.on('click', handleMouseClick)

  }, [line])

  console.log('Line', {line})

  return (
    <g className={'flowchart-editor_line'}>
      <Path
        id={line.id}
        parts={line.parts}
        selected={line.state === LineStateNames.Selected}
        MarkerProps={{type: getMarkerType(line)}}
        onClick={handlePathClick}
        onMouseDown={handlePathMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <TextPath href={`#${line.id}`} text={line.id}/>
      <circle
        data-id={line.id}
        ref={handleLineTargetRef}
        className={'flowchart-editor_handle-line'}
        cx={getLineTargetPosition(line.parts).x}
        cy={getLineTargetPosition(line.parts).y}
        r={12}
      />
    </g>
  )
}

export default React.memo(Line)

export * from './types'
export * from './utils'
