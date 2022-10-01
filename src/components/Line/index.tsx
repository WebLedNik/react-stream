import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import {v4 as uuidv4} from 'uuid';
import './style.css'
import {LineState, Part} from "./types";
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import {Directions, Orientation, Position} from "../../types";
import {validateAcceptableInterval} from "./utils";
import Path from "./Path";
import UpdatingPath from "./UpdatingPath";
import uniqBy from 'lodash.uniqby'
import {MarkerTypeNames} from "../LineRenderer/types";
import {getOrientationFromDirection} from "../Handle/utils";


interface LineProps {
  line: LineState
}

const Line: React.FC<LineProps> = (props) => {
  const {line} = props
  const pathRef = useRef(null)
  const handleLineTargetRef = useRef(null)
  const {zoomTransformState, updateLines, lines}: FlowchartEditorState = useStore((state) => state)

  const [parts, setParts] = useState<Part[]>([])
  const [transformingPart, setTransformingPart] = useState<Part | null | undefined>()
  const [countDrawnParts, setCountDrawnParts] = useState<number>(0)

  const targetPosition: Position = useMemo(() => {
    const part = line.parts[line.parts.length - 1]
    if (!part) return {x: 0, y: 0}

    return part.end
  }, [line])

  const removeRudimentsParts = (parts: Part[]) => {
    return parts.reduce((result: Part[], targetPart: Part, targetPartIndex: number, array) => {
      if ((targetPart.start.x === targetPart.end.x) && (targetPart.start.y === targetPart.end.y)) {
        const prevPart: Part | undefined = result[targetPartIndex - 1]
        const nextPart: Part | undefined = array[targetPartIndex + 1]

        if (prevPart?.orientation !== nextPart?.orientation) return [...result, targetPart]
        const payload = result.slice()
        payload.splice(targetPartIndex - 1, 2, {...nextPart, start: prevPart.start})

        return payload
      }
      return result.map(p => p.id).includes(targetPart.id) ? result : [...result, targetPart]
    }, [])
  }

  interface createPartProps {
    line: LineState,
    orientation: Orientation
  }

  const createPart = (props: createPartProps) => {
    const {line, orientation} = props
    const newPart: Part = {
      id: uuidv4(),
      start: line.source.position,
      end: line.source.position,
      orientation
    }

    setCountDrawnParts(countDrawnParts + 1)
    return setParts([...parts, newPart])
  }

  interface createNewOrientationPartProps {
    prevIndex: number,
    mousePosition: Position
  }

  const createNewOrientationPart = (props: createNewOrientationPartProps) => {
    const {prevIndex, mousePosition} = props
    const prevPart: Part | undefined = parts[prevIndex]

    if (!prevPart) return

    const newOrientation = (prevPart.orientation === Orientation.Horizontal) ? Orientation.Vertical : Orientation.Horizontal
    const newPart: Part = {
      id: uuidv4(),
      orientation: newOrientation,
      start: prevPart.end,
      end: {
        x: (newOrientation === Orientation.Horizontal) ? mousePosition.x : prevPart.end.x,
        y: (newOrientation === Orientation.Vertical) ? mousePosition.y : prevPart.end.y
      }
    }

    setCountDrawnParts(countDrawnParts + 1)
    return setParts([...parts, newPart])
  }

  interface updatePrevTargetPartProps {
    targetIndex: number,
    mousePosition: Position
  }

  const updatePrevTargetPart = (props: updatePrevTargetPartProps) => {
    const {targetIndex, mousePosition} = props
    const validateIntervalPart: Part | undefined = parts[targetIndex - 2]
    const prevPart: Part | undefined = parts[targetIndex - 1]
    const targetPart: Part | undefined = parts[targetIndex]

    if (!targetPart) return

    const isWithinIntervalValidateIntervalPart = validateIntervalPart && validateAcceptableInterval({
      target: mousePosition,
      root: validateIntervalPart.end,
      orientation: validateIntervalPart.orientation
    })

    const updatedPrevPart: Part | undefined = prevPart && {
      ...prevPart,
      end: {
        x: (prevPart.orientation === Orientation.Horizontal) ? mousePosition.x : prevPart.end.x,
        y: (prevPart.orientation === Orientation.Vertical) ? mousePosition.y : prevPart.end.y
      }
    }

    const updatedTargetPart: Part = {
      ...targetPart,
      start: isWithinIntervalValidateIntervalPart ? validateIntervalPart.end : (updatedPrevPart?.end ?? targetPart.start),
      end: {
        x: isWithinIntervalValidateIntervalPart ? ((validateIntervalPart.orientation === Orientation.Horizontal) ? validateIntervalPart.end.x : mousePosition.x) : ((targetPart.orientation === Orientation.Horizontal) ? targetPart.end.x : mousePosition.x),
        y: isWithinIntervalValidateIntervalPart ? ((validateIntervalPart.orientation === Orientation.Vertical) ? validateIntervalPart.end.y : mousePosition.y) : ((targetPart.orientation === Orientation.Vertical) ? targetPart.end.y : mousePosition.y)
      }
    }

    const payload = parts.map(p => {
      if (p.id === updatedPrevPart?.id) return (isWithinIntervalValidateIntervalPart ? updatedTargetPart : updatedPrevPart)
      if (p.id === updatedTargetPart.id) return updatedTargetPart
      return p
    })

    if (isWithinIntervalValidateIntervalPart) setCountDrawnParts(countDrawnParts - 1)
    return setParts(uniqBy(payload, 'id'))
  }

  interface updateTargetPartProps {
    targetIndex: number,
    mousePosition: Position
  }

  const updateTargetPart = (props: updateTargetPartProps) => {
    const {targetIndex, mousePosition} = props
    const prevPart: Part | undefined = parts[targetIndex - 1]
    const targetPart: Part | undefined = parts[targetIndex]

    if (!targetPart) return

    const isWithinIntervalPrevPart = prevPart && validateAcceptableInterval({
      target: mousePosition,
      root: prevPart.end,
      orientation: prevPart.orientation
    })

    const updatedTargetPart = {
      ...targetPart,
      orientation: isWithinIntervalPrevPart ? prevPart?.orientation : targetPart.orientation,
      start: isWithinIntervalPrevPart ? prevPart?.start : targetPart.start,
      end: {
        x: isWithinIntervalPrevPart ? ((prevPart.orientation === Orientation.Horizontal) ? mousePosition.x : prevPart.end.x) : ((targetPart.orientation === Orientation.Horizontal) ? mousePosition.x : targetPart.end.x),
        y: isWithinIntervalPrevPart ? ((prevPart.orientation === Orientation.Vertical) ? mousePosition.y : prevPart.end.y) : ((targetPart.orientation === Orientation.Vertical) ? mousePosition.y : targetPart.end.y)
      }
    }

    const payload = parts.map(p => {
      if ((p.id === updatedTargetPart.id) && !isWithinIntervalPrevPart) return updatedTargetPart
      if ((p.id === prevPart?.id) && isWithinIntervalPrevPart) return updatedTargetPart

      return p
    })

    if (isWithinIntervalPrevPart) setCountDrawnParts(countDrawnParts - 1)
    // console.log('updateTargetPart')
    return setParts(uniqBy(payload, 'id'))
  }

  interface updateTransformingPartProps {
    targetIndex: number,
    mousePosition: Position
  }

  const updateTransformingPart = (props: updateTransformingPartProps) => {
    const {targetIndex, mousePosition} = props

    const validateIntervalPrevPart: Part | undefined = parts[targetIndex - 2]
    const prevPart: Part | undefined = parts[targetIndex - 1]
    const targetPart: Part | undefined = parts[targetIndex]
    const nextPart: Part | undefined = parts[targetIndex + 1]
    const validateIntervalNextPart: Part | undefined = parts[targetIndex + 2]

    if (!targetPart) return
    if (!prevPart) {
      const newPartHorizontal: Part = {
        id: uuidv4(),
        start: targetPart.start,
        end: {x: targetPart.start.x + 1, y: targetPart.start.y},
        orientation: Orientation.Horizontal
      }

      const newPartVertical: Part = {
        id: uuidv4(),
        start: newPartHorizontal.end,
        end: {x: newPartHorizontal.end.x, y: newPartHorizontal.end.y + 11},
        orientation: Orientation.Vertical
      }

      return setParts([newPartHorizontal, newPartVertical, ...parts])
    }

    const isWithinIntervalValidateIntervalPrevPart = validateIntervalPrevPart && validateAcceptableInterval({
      target: mousePosition,
      root: validateIntervalPrevPart.end,
      orientation: validateIntervalPrevPart.orientation
    })
    const isWithinIntervalValidateIntervalNextPart = validateIntervalNextPart && validateAcceptableInterval({
      target: mousePosition,
      root: validateIntervalNextPart.end,
      orientation: validateIntervalNextPart.orientation
    })

    const updatedTargetPart: Part = {
      ...targetPart,
      start: (isWithinIntervalValidateIntervalPrevPart || isWithinIntervalValidateIntervalNextPart) ?
        (isWithinIntervalValidateIntervalPrevPart ? validateIntervalPrevPart.end : (targetPart.orientation === Orientation.Horizontal ? {
          x: targetPart.start.x,
          y: validateIntervalNextPart.start.y
        } : {x: validateIntervalNextPart.start.x, y: targetPart.start.y})) : {
          x: (targetPart.orientation === Orientation.Horizontal) ? targetPart.start.x : mousePosition.x,
          y: (targetPart.orientation === Orientation.Vertical) ? targetPart.start.y : mousePosition.y,
        },
      end: {
        x: (isWithinIntervalValidateIntervalPrevPart || isWithinIntervalValidateIntervalNextPart) ?
          (isWithinIntervalValidateIntervalPrevPart ? ((validateIntervalPrevPart.orientation === Orientation.Horizontal) ? targetPart.end.x : validateIntervalPrevPart.end.x) : ((validateIntervalNextPart.orientation === Orientation.Horizontal) ? targetPart.end.x : validateIntervalNextPart.end.x))
          : ((targetPart.orientation === Orientation.Horizontal) ? targetPart.end.x : mousePosition.x),
        y: (isWithinIntervalValidateIntervalPrevPart || isWithinIntervalValidateIntervalNextPart) ?
          (isWithinIntervalValidateIntervalPrevPart ? ((validateIntervalPrevPart.orientation === Orientation.Vertical) ? targetPart.end.y : validateIntervalPrevPart.end.y) : ((validateIntervalNextPart.orientation === Orientation.Vertical) ? targetPart.end.y : validateIntervalNextPart.end.y))
          : ((targetPart.orientation === Orientation.Vertical) ? targetPart.end.y : mousePosition.y),
      }
    }

    const updatedPrevPart: Part | undefined = prevPart && {
      ...prevPart,
      end: updatedTargetPart.start
    }

    const updatedNextPart: Part | undefined = nextPart && {
      ...nextPart,
      start: updatedTargetPart.end
    }

    const payload = parts.map(p => {
      if (p.id === updatedPrevPart?.id) return updatedPrevPart
      if (p.id === updatedTargetPart.id) return updatedTargetPart
      if (p.id === updatedNextPart?.id) return updatedNextPart

      return p
    })
    // console.log('updateTransformingPart', {payload})
    return setParts(payload)
  }

  const handleMouseUp = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (!line.creating && !line.updating) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    const payload: LineState = {
      ...line,
      parts: removeRudimentsParts(parts),
      creating: false,
      updating: false,
      target: (line.target.handle ? line.target : {...line.target, position: {x, y}})
    }

    updateLines([payload])
    setCountDrawnParts(0)
    setParts([])

    window.document.getElementsByClassName('flowchart-editor')[0]?.removeEventListener('mousemove', handleMouseMove)
  }
  const handleMouseMove = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (!line.creating && !line.updating) return

    const maxCountDrawnParts = 2
    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k
    const lastPart = parts[parts.length - 1]

    if (!lastPart) {
      const orientation = getOrientationFromDirection({direction: line.source.handle.direction})

      return createPart({line, orientation})
    }

    const isWithinInterval = validateAcceptableInterval({
      target: {x, y},
      root: lastPart.end,
      orientation: lastPart.orientation
    })

    if (line.updating && transformingPart) {
      const targetIndex = parts.findIndex(p => p.id === transformingPart.id)
      return updateTransformingPart({targetIndex, mousePosition: {x, y}})
    }

    if (line.creating) {
      if (!isWithinInterval && (countDrawnParts < maxCountDrawnParts)) return createNewOrientationPart({
        prevIndex: parts.length - 1,
        mousePosition: {x, y}
      })
      if (!isWithinInterval && (countDrawnParts >= maxCountDrawnParts)) return updatePrevTargetPart({
        targetIndex: parts.length - 1,
        mousePosition: {x, y}
      })
      if (isWithinInterval && (countDrawnParts <= maxCountDrawnParts)) return updateTargetPart({
        targetIndex: parts.length - 1,
        mousePosition: {x, y}
      })
    }
    ;
  }
  const handlePathClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    //console.log('handlePathClick', {line})
    const payload: LineState = {
      ...line,
      selected: !line.selected
    }

    updateLines([payload])
  }

  const handlePathMouseDown = (event: MouseEvent, part: Part) => {
    event.stopPropagation()

    const payload: LineState = {
      ...line,
      updating: true
    }

    setTransformingPart(part)
    setParts(line.parts)
    updateLines([payload])
  }

  const handleMouseOver = (event: MouseEvent, part: Part) => {
    event.stopPropagation()
  }

  useEffect(() => {
    const selectionHandleLineTarget = select(handleLineTargetRef.current)

    selectionHandleLineTarget.on('mousedown', (event) => {
      // console.log('selectionHandleLineTarget mousedown')
      event.stopPropagation();
      event.preventDefault()

      const payload: LineState = {
        ...line,
        creating: true,
        target: {...line.target, handle: undefined, position: undefined}
      }

      setParts(line.parts)
      setCountDrawnParts(countDrawnParts + 1)
      updateLines([payload])
    })
    selectionHandleLineTarget.on('click', (event) => {
      // console.log('selectionHandleLineTarget click')
      event.stopPropagation();
      event.preventDefault()

      handlePathClick(event)
    })
  }, [line])
  useEffect(() => {
    const flowchartEditorElement = window.document.getElementsByClassName('flowchart-editor')[0]

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
  }, [line, zoomTransformState, parts])

  // console.log('Line FC', {parts, line})
  return (
    <g className={'flowchart-editor_line'}>
      <UpdatingPath parts={parts} MarkerProps={{type: MarkerTypeNames.Arrow}}/>
      <Path
        onClick={handlePathClick}
        onMouseDown={handlePathMouseDown}
        onMouseOver={handleMouseOver}
        parts={line.parts}
        selected={line.selected}
        MarkerProps={{type: line.target.handle ? MarkerTypeNames.Hidden : MarkerTypeNames.Arrow}}
      />
      <circle
        data-id={line.id}
        ref={handleLineTargetRef}
        className={'flowchart-editor_handle-line'}
        cx={targetPosition.x}
        cy={targetPosition.y}
        r={12}
      />
    </g>
  )
}

Line.displayName = 'Line'
export default Line
export * from './types'
export * from './utils'