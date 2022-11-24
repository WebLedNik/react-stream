import * as React from 'react'
import './style.css'
import {FlowchartEditorState, useStore} from "../../store";
import {NodeDTO} from "../Node";

export interface ControlsProps{}
const Controls: React.FC<ControlsProps> = () => {
  const {setNodes, reset, lines, nodes}:FlowchartEditorState = useStore((state) => state)

  const handleLogs = () => {
    console.log('logs', {lines, nodes})
  }

  const handleAddNode = () => {
    const payload:NodeDTO = {

    }
    setNodes([payload])
  }

  const handleReset = () => {
    reset()
  }

  return(
    <div className={'flowchart-editor_controls'}>
      <button onClick={handleAddNode}>Add node</button>
      <button onClick={handleReset}>Reset</button>
      <button onClick={handleLogs}>Logs</button>
    </div>
  )
}

Controls.displayName = 'FlowchartControls'
export default Controls