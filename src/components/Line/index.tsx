import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import './style.css'
import {LineState} from "./types";
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import {getDirectionCursor, getOrientation} from "../../utils";
import {Directions, Orientation, Position} from "../../types";
import {Path} from "./utils";
import PathComponent from "./Path"

interface LineProps {
  line: LineState
}

const Line: React.FC<LineProps> = (props) => {
  const {line} = props
  const pathRef = useRef(null)
  const handleLineTargetRef = useRef(null)
  const {zoomTransformState, updateLines}: FlowchartEditorState = useStore((state) => state)

  const [mouseMovePosition, setMouseMovePosition] = useState<Position | null>(null)
  const [countPathDraw, setCountPathDraw] = useState<number>(0)

  const sourcePosition: Position = useMemo(() => line.source.position, [line])
  const targetPosition: Position = useMemo(() => mouseMovePosition ?? line.target.position, [line, mouseMovePosition])
  const paths = useMemo(() => line.paths.map((path, index, array) => {
    if (index === 0) {
      return {...path, moveTo: {...line.source.position}}
    }

    if (index === (array.length - 1)) {
      return {...path, lineTo: {...line.target.position}}
    }

    return path
  }), [line, sourcePosition, targetPosition])

  const handleMouseUp = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (!line.transforming) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    const payload: LineState = {
      ...line,
      transforming: false,
      target: {position: {x, y}}
    }

    updateLines([payload])
    setMouseMovePosition(null)
  }
  const handleMouseMove = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    const maxCountPathDraw = 1
    const margin = 20
    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k
    const currentPath = line.paths[line.paths.length - 1]

    if (!currentPath || !line.transforming) return;

    const orientation = getOrientation(currentPath.direction)
    const isVertical = Boolean(currentPath.direction === Directions.Bottom || currentPath.direction === Directions.Top)
    const rootX = (orientation === Orientation.Horizontal) ? (Number(mouseMovePosition?.x) - margin) : currentPath.lineTo.x
    const rootY = (orientation === Orientation.Vertical) ? (Number(mouseMovePosition?.y) - margin) : currentPath.lineTo.y
    const direction = getDirectionCursor({clientX: x, clientY: y, rootX, rootY})

    if (countPathDraw > maxCountPathDraw) {
      const lastDrawnPaths = line.paths.slice(-2)
      const current = (orientation === Orientation.Vertical) ? lastDrawnPaths.find(path => getOrientation(path.direction) === Orientation.Vertical) : lastDrawnPaths.find(path => getOrientation(path.direction) === Orientation.Horizontal)

      if (!current) return;
      console.log({current})
      const paths = line.paths.map(path => {
        if (path.id === current.id){
          return {...path, lineTo: {x,y}}
        }

        return path
      })

      const payload: LineState = {
        ...line,
        paths: paths
      }

      console.log({paths})
      return
    }

    if (direction && direction !== currentPath.direction) {
      setCountPathDraw((param) => ++param)
      const path = new Path({
        direction,
        moveTo: {x: x - (isVertical ? margin : 0), y: y - (!isVertical ? margin : 0)},
        lineTo: {x, y}
      })
      const payload: LineState = {
        ...line,
        paths: [...line.paths, path]
      }

      updateLines([payload])
    }

    setMouseMovePosition({x, y})
  }

  useEffect(() => {
    const selectionLine = select(pathRef.current)
    const selectionHandleLineTarget = select(handleLineTargetRef.current)

    selectionLine.on('click', (event) => {
      const payload: LineState = {
        ...line,
        selected: true
      }

      updateLines([payload])
    })
    selectionHandleLineTarget.on('mousedown', (event) => {
      event.stopPropagation();
      event.preventDefault()

      const payload: LineState = {
        ...line,
        transforming: true
      }

      updateLines([payload])
    })

    window.document.addEventListener('mouseup', handleMouseUp, {once: true})
  }, [line, zoomTransformState])

  window.document.getElementsByClassName('flowchart-editor')[0]?.addEventListener('mousemove', handleMouseMove, {once: true})
  // console.log('LineComponent', {props})
  return (
    <g className={'flowchart-editor_line'}>
      {!Boolean(line.source.id) &&
        <circle className={'flowchart-editor_handle-line'} cx={sourcePosition.x} cy={sourcePosition.y} r={12}/>}
      {paths.map(path => <PathComponent key={path.id} path={path} mousePosition={mouseMovePosition}/>)}
      {!Boolean(line.target.id) &&
        <circle ref={handleLineTargetRef} className={'flowchart-editor_handle-line'} cx={targetPosition.x}
                cy={targetPosition.y} r={12}/>}
    </g>
  )
}

Line.displayName = 'Line'
export default Line
export * from './types'
export * from './utils'