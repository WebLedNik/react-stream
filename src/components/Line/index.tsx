import * as React from "react";
import {useEffect, useRef, useState} from "react";
import './style.css'
import {LineState, LineStateNames, Part, PartStateNames} from "./types";
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import Path from "./Path";
import {getRootElement} from "../../utils";
import TextPath from "./TextPath";

interface LineProps {
  line: LineState
}

const Line: React.FC<LineProps> = (props) => {
  const {line} = props

  const handleLineTargetRef = useRef(null)
  const {zoomTransformState, updateLines, lines}: FlowchartEditorState = useStore((state) => state)

  const [isReRender, setIsReRender] = useState<boolean>(false)

  const handleMouseUp = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    setIsReRender(!isReRender)

    if (!line.getIsModified()) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    line.setTransform({position: {x,y}})
    window.document.getElementsByClassName('flowchart-editor')[0]?.removeEventListener('mousemove', handleMouseMove)
  }
  const handleMouseMove = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    setIsReRender(!isReRender)

    if (!line.getIsModified()) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    line.setPart({position: {x,y}})
  }
  const handleMouseDown = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault()

    line.setState(LineStateNames.Created)
    setIsReRender(!isReRender)
  }

  const handleMouseClick = (event: MouseEvent) => {}

  const handlePathClick = (event: React.MouseEvent | MouseEvent) => {}

  const handlePathMouseDown = (event: MouseEvent, part: Part) => {
    line.setState(LineStateNames.Updated)
    line.setStatePart({part, state:PartStateNames.Updated})

    setIsReRender(!isReRender)
  }

  const handleMouseEnter = (event: MouseEvent, part: Part) => {
    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    // const creatingLine = lines.find(line => line.state === LineStateNames.Created)
    // if (creatingLine && (creatingLine.id !== line.id)) return creatingLine.setTarget({position: {x, y}, line})
  }

  const handleMouseLeave = (event: MouseEvent, part: Part) => {
    // const creatingLine = lines.find(line => line.state === LineStateNames.Created)
    // if (creatingLine && (creatingLine.id !== line.id)) return creatingLine.setTarget({line: undefined})
  }

  useEffect(() => {
    const selectionHandleLineTarget = select(handleLineTargetRef.current)

    selectionHandleLineTarget.on('mousedown', handleMouseDown)
    selectionHandleLineTarget.on('click', handleMouseClick)
  }, [line])
  useEffect(() => {
    const flowchartEditorElement = getRootElement()

    if (flowchartEditorElement) {
      flowchartEditorElement.addEventListener('mouseup', handleMouseUp, {once: true})
      flowchartEditorElement.addEventListener('mousemove', handleMouseMove, {once: true})
    }

    return () => {
      if (flowchartEditorElement) {
        flowchartEditorElement.removeEventListener('mouseup', handleMouseUp)
        flowchartEditorElement.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [line, zoomTransformState, isReRender])

  return (
    <g className={'flowchart-editor_line'}>
      <Path
        id={line.id}
        parts={line.parts}
        selected={line.state === LineStateNames.Selected}
        MarkerProps={{type: line.getMarkerType()}}
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
        cx={line.getTargetPosition().x}
        cy={line.getTargetPosition().y}
        r={12}
      />
    </g>
  )
}

Line.displayName = 'Line'

const linePropsAreEqual = (prevMovie: LineProps, nextMovie: LineProps) => {
  return prevMovie.line.id === nextMovie.line.id
}

export default React.memo(Line, linePropsAreEqual)

export * from './types'
export * from './utils'