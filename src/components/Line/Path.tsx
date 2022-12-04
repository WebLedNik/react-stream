import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import cc from "classcat"
import {Part} from "./types";
import {ElementTypeNames, Orientation} from "../../types";
import {select} from "d3-selection";
import {FlowchartEditorState, useStore} from "../../store";
import {MarkerProps, MarkerTypeNames} from "../LineRenderer/types";

export interface PathProps {
  id: string
  parts: Part[]
  onClick?(event: React.MouseEvent): void
  onMouseDown?(event: MouseEvent, part: Part): void
  onMouseEnter?(event: MouseEvent, part: Part): void
  onMouseLeave?(event: MouseEvent, part: Part): void
  updating?: boolean
  selected?: boolean
  MarkerProps?: MarkerProps
}

const Path: React.FC<PathProps> = (props) => {
  const {id, parts, updating, selected, MarkerProps, onClick, onMouseDown, onMouseEnter, onMouseLeave} = props
  const {lines}: FlowchartEditorState = useStore((state) => state)
  const pathRef = useRef(null)
  const d: string = useMemo(() => {
    const transformedParts = parts.slice()
    const startPart = transformedParts.shift()
    const lastPart = transformedParts.pop() ?? startPart

    if (!startPart || !lastPart) return ''

    if (!Boolean(transformedParts.length)) {
      return `M ${startPart?.start.x} ${startPart?.start.y} L ${startPart?.end.x} ${startPart?.end.y} L ${lastPart?.end.x} ${lastPart?.end.y}`
    }

    return `M ${startPart?.start.x} ${startPart?.start.y} ${transformedParts.map(p => `L ${p.start.x} ${p.start.y} L ${p.end.x} ${p.end.y}`)} L ${lastPart?.end.x} ${lastPart?.end.y}`
  }, [parts])

  const [transformingPart, setTransformingPart] = useState<Part | undefined>()

  const cursor = useMemo(() => (transformingPart?.orientation === Orientation.Horizontal) ? 'row-resize' : 'col-resize', [transformingPart])

  const handleMouseEnter = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    const margin = 5
    const offsetX = event.offsetX
    const offsetY = event.offsetY
    const targetPart = parts.find(p => (offsetX >= (p.start.x - margin)) && (offsetX <= (p.end.x + margin)) && (offsetY >= (p.start.y - margin)) && (offsetY <= (p.end.y + margin)))
    const invertTargetPart = parts.find(p => (offsetX <= (p.start.x + margin)) && (offsetX >= (p.end.x - margin)) && (offsetY <= (p.start.y + margin)) && (offsetY >= (p.end.y - margin)))
    const payloadTargetPart = targetPart ?? invertTargetPart

    if (!payloadTargetPart) return

    onMouseEnter && onMouseEnter(event, payloadTargetPart)
    return setTransformingPart(payloadTargetPart)
  }

  const handleMouseLeave = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    const margin = 5
    const offsetX = event.offsetX
    const offsetY = event.offsetY
    const targetPart = parts.find(p => (offsetX >= (p.start.x - margin)) && (offsetX <= (p.end.x + margin)) && (offsetY >= (p.start.y - margin)) && (offsetY <= (p.end.y + margin)))
    const invertTargetPart = parts.find(p => (offsetX <= (p.start.x + margin)) && (offsetX >= (p.end.x - margin)) && (offsetY <= (p.start.y + margin)) && (offsetY >= (p.end.y - margin)))
    const payloadTargetPart = targetPart ?? invertTargetPart

    if (!payloadTargetPart) return

    onMouseLeave && onMouseLeave(event, payloadTargetPart)
  }

  const handleMouseDown = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    onMouseDown && transformingPart && onMouseDown(event, transformingPart)
  }

  useEffect(() => {
    const selection = select(pathRef.current)

    selection.on('mousedown', handleMouseDown)
    selection.on('mouseenter', handleMouseEnter)
    selection.on('mouseleave', handleMouseLeave)
  }, [parts, transformingPart, lines])

  return (
    <path
      id={id}
      ref={pathRef}
      className={cc(['flowchart-editor_line-path', {['_updating']: updating, ['_selected']: selected}])}
      cursor={cursor}
      d={d}
      pointerEvents={'stroke'}
      markerEnd={`url(#${MarkerProps?.type ?? MarkerTypeNames.Arrow}${(updating ? '-updating' : '')})`}
      data-id={id}
      data-element-type={ElementTypeNames.Path}
    />
  )
}

export default Path