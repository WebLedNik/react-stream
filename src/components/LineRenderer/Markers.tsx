import * as React from "react";
import './style.css'
import {MarkerTypeNames} from "./types";

interface MarkersProps{}
const Markers:React.FC<MarkersProps> = (props) => {
  const {} = props
  return(
    <>
      <marker
        id={MarkerTypeNames.Arrow}
        className={'flowchart-editor_line-marker'}
        markerWidth="8"
        markerHeight="6"
        refX="4" refY="3"
        orient="auto"
      >
        <polyline points="0,0 8,3 0,6 2,3"/>
      </marker>
      <marker
        id={MarkerTypeNames.Arrow + '-updating'}
        className={'flowchart-editor_line-marker _updating'}
        markerWidth="8"
        markerHeight="6"
        refX="4" refY="3"
        orient="auto"
      >
        <polyline points="0,0 8,3 0,6 2,3"/>
      </marker>
      <marker
        id={MarkerTypeNames.Circle}
        className={'flowchart-editor_line-marker'}
        markerWidth="4"
        markerHeight="4"
        refX="2" refY="2"
        orient="auto"
      >
        <circle cx="2" cy="2" r="2"/>
      </marker>
    </>
  )
}

export default Markers