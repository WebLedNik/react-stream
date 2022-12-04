import * as React from 'react'
import './style.css'
import {FlowchartEditorState, useStore} from "../../store";

export interface ControlsProps{}
const Controls: React.FC<ControlsProps> = () => {
  const {lines, nodes}:FlowchartEditorState = useStore((state) => state)

  const handleLogs = (event: React.MouseEvent) => {
    console.log('Library logs', {nodes, lines})
  }

  return(
    <div className={'flowchart-editor_controls'}>
      <button onClick={handleLogs}>Logs</button>
    </div>
  )
}

Controls.displayName = 'FlowchartControls'
export default Controls