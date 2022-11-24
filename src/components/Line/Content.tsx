import * as React from "react";
import {useEffect, useRef, useState} from "react";
import './style.css'
import {LineState, LineStateNames, Part, PartStateNames} from "./types";
import {select} from "d3-selection";
import Path from "./Path";
import {getRootElement} from "../../utils";
import TextPath from "./TextPath";
import {isEqual} from "lodash";
import {ZoomTransform} from "d3-zoom";

interface ContentProps {
  line: LineState
  zoomTransformState: ZoomTransform
}

const Content: React.FC<ContentProps> = (props) => {
  const {line, zoomTransformState} = props

  const handleLineTargetRef = useRef(null)
  const [isRender, setIsRender] = useState<boolean>(false)

  const handleMouseUp = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    setIsRender(!isRender)

    if (!line.getIsModified()) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    line.setTransform({position: {x,y}})
  }

  const handleMouseMove = (event: MouseEvent) => {
    console.log('handleMouseMove')
    event.stopPropagation()
    event.preventDefault()

    setIsRender(!isRender)

    if (!line.getIsModified()) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    line.setPart({position: {x,y}})
  }

  const handleMouseDown = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault()

    line.setState(LineStateNames.Created)
    setIsRender(!isRender)
  }

  const handleMouseClick = (event: MouseEvent) => {
  }

  const handlePathClick = (event: React.MouseEvent | MouseEvent) => {
  }

  const handlePathMouseDown = (event: MouseEvent, part: Part) => {
    line.setState(LineStateNames.Updated)
    line.setStatePart({part, state: PartStateNames.Updated})

    setIsRender(!isRender)
  }

  const handleMouseEnter = (event: MouseEvent, part: Part) => {
  }

  const handleMouseLeave = (event: MouseEvent, part: Part) => {
  }

  useEffect(() => {
    getRootElement().addEventListener('mouseup', handleMouseUp, {once: true})
    getRootElement().addEventListener('mousemove', handleMouseMove, {once: true})
  }, [line, zoomTransformState, isRender])

  useEffect(() => {
    const selectionHandleLineTarget = select(handleLineTargetRef.current)

    selectionHandleLineTarget.on('mousedown', handleMouseDown)
    selectionHandleLineTarget.on('click', handleMouseClick)
  }, [line])



  console.log('Line', {line})

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

const areEqual = (prevProps: ContentProps, nextProps: ContentProps) => isEqual(prevProps.line, nextProps.line) && isEqual(prevProps.zoomTransformState, nextProps.zoomTransformState)
export default React.memo(Content, areEqual)