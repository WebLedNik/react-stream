import * as React from 'react'
import './style.css'
import Markers from "./Markers";
import {isEqualArray} from "../../utils";
import Line, {LineState} from "../Line";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";
import {useEffect} from "react";
import {ElementTypeNames} from "../../types";

export interface LineRendererProps {
  onLinesChange?: (lines: LineState[], isCreate?: boolean) => void
}

const LineRenderer: React.FC<LineRendererProps> = (props) => {
  const {
    onLinesChange
  } = props
  const lines = useStore((state: FlowchartEditorState) => state.lines, shallow)

  return (
    <svg className={'flowchart-editor_lines'} data-element-type={ElementTypeNames.EditorLines}>
      <defs>
        <Markers/>
      </defs>
      <g>
        {lines.map(line => <Line key={line.id} line={line} onLinesChange={onLinesChange}/>)}
      </g>
    </svg>
  )
}

LineRenderer.displayName = 'FlowchartLineRenderer'
export default LineRenderer

export * from './types'