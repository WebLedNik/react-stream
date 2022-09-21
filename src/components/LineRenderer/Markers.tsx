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
        refX="4" refY="3"
        orient="auto"
      >
        <polyline points="0,1 6,3 0,5"/>
      </marker>
    </>
  )
}

export default Markers