import * as React from "react";
import './style.css'

interface MarkersProps{}
const Markers:React.FC<MarkersProps> = (props) => {
  const {} = props
  return(
    <>
      <marker
        id="handle-line-target"
        className={'flowchart-editor_line-marker'}
        markerWidth="8"
        markerHeight="6"
        refX="8" refY="3"
        orient="auto"
      >
        <polyline points="0,0 8,3 0,6 2,3"/>
      </marker>
      <marker
        id="handle-line-target-updating"
        className={'flowchart-editor_line-marker _updating'}
        markerWidth="8"
        markerHeight="6"
        refX="8" refY="3"
        orient="auto"
      >
        <polyline points="0,0 8,3 0,6 2,3"/>
      </marker>
    </>
  )
}

export default Markers