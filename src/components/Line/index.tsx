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
import {ElementTypeNames} from "../../types";

interface ContentProps {
  line: LineState
  onLinesChange?: (lines: LineState[], isCreate?: boolean) => void
}

const Line: React.FC<ContentProps> = (props) => {
  const {
    line,
    onLinesChange
  } = props

  const handleLineTargetRef = useRef(null)

  const handlePathMouseDown = (event: MouseEvent, part: Part) => {
    const payloadLine = setLineState({line, state: LineStateNames.Updated})
    const payloadParts = setLineStatePart({parts: payloadLine.parts, part, state: PartStateNames.Updated})

    onLinesChange && onLinesChange([{...payloadLine, parts: payloadParts}])
    return
  }

  return (
    <g className={'flowchart-editor_line'}>
      <Path
        line={line}
        MarkerProps={{type: getMarkerType(line)}}
        onMouseDown={handlePathMouseDown}
      />
      <TextPath href={`#${line.id}`} text={line.id}/>
      <circle
        data-id={line.id}
        data-element-type={ElementTypeNames.LineHandle}
        ref={handleLineTargetRef}
        className={'flowchart-editor_handle-line'}
        cx={getLineTargetPosition(line.parts).x}
        cy={getLineTargetPosition(line.parts).y}
        r={12}
      />
    </g>
  )
}

Line.displayName = 'FlowchartLine'
export default React.memo(Line)

export * from './types'
export * from './utils'
