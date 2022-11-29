import * as React from "react";
import {useEffect, useRef} from "react";
import './style.css'
import {LineState, LineStateNames, Part, PartStateNames} from "./types";
import {select} from "d3-selection";
import Path from "./Path";
import {getRelativePosition} from "../../utils";
import TextPath from "./TextPath";
import {
  getLineTargetPosition,
  getMarkerType,
  setLineSourcePosition,
  setLineState,
  setLineStatePart,
  setLineTargetPosition
} from "./utils";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";
import {getHandleElement, HandleTypeNames, HandleValues} from "../Handle";
import {getNodeElement} from "../Node";

interface ContentProps {
  line: LineState
}

const Line: React.FC<ContentProps> = (props) => {
  const {line} = props
  const {updateLines, zoomTransformState} = useStore((state: FlowchartEditorState) => ({zoomTransformState: state.zoomTransformState, updateLines: state.updateLines}), shallow)

  const handleLineTargetRef = useRef(null)

  const handleMouseDown = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault()

    const payload = setLineState({line, state: LineStateNames.Created})
    updateLines([payload])
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
