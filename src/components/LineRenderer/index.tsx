import * as React from 'react'
import './style.css'
import {FlowchartEditorState, useStore} from "../../store";
import Line from "../Line";
import Markers from "./Markers";
import {useEffect} from "react";

export interface LineRendererProps {
}

const LineRenderer: React.FC<LineRendererProps> = (props) => {
  const {} = props
  const {lines, removeLines}: FlowchartEditorState = useStore((state) => state)

  const handleKeyUp = (event: KeyboardEvent) => {
    event.stopPropagation()
    event.preventDefault()

    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        const payload = lines.filter(line => line.selected).map(line => line.id)
        return removeLines(payload)
    }
  }

  useEffect(() => {
    window.document.addEventListener('keyup', handleKeyUp)

    return () => {
      window.document.removeEventListener('keyup', handleKeyUp)
    }
  }, [lines])

  return (
    <svg className={'flowchart-editor_lines'}>
      <defs>
        <Markers/>
      </defs>
      <g>
        {lines.map(line => <Line key={line.id} line={line}/>)}
      </g>
    </svg>
  )
}

LineRenderer.displayName = 'LineRenderer'
export default LineRenderer