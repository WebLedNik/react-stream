import * as React from 'react'
import './style.css'
import Markers from "./Markers";
import {isEqualArray} from "../../utils";
import {LineComponent, LineState} from "../Line";

export interface LineRendererProps {
  lines: LineState[]
}

const LineRenderer: React.FC<LineRendererProps> = (props) => {
  const {lines} = props

  console.log('LineRenderer')

  return (
    <svg className={'flowchart-editor_lines'}>
      <defs>
        <Markers/>
      </defs>
      <g>
        {lines.map(line => <LineComponent key={line.id} line={line}/>)}
      </g>
    </svg>
  )
}

LineRenderer.displayName = 'FlowchartLineRenderer'
const areEqual = (prevProps: LineRendererProps, nextProps: LineRendererProps) => isEqualArray(prevProps.lines, nextProps.lines)
export default React.memo(LineRenderer, areEqual)

export * from './types'