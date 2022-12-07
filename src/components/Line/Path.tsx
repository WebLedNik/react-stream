import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import cc from "classcat"
import {LineState, LineStateNames, Part} from "./types";
import {ElementTypeNames, Orientation} from "../../types";
import {select} from "d3-selection";
import {FlowchartEditorState, useStore} from "../../store";
import {MarkerProps, MarkerTypeNames} from "../LineRenderer/types";

export interface PathProps {
  line: LineState
  onClick?(event: React.MouseEvent): void
  onMouseDown?(event: MouseEvent, part: Part): void
  onMouseEnter?(event: MouseEvent, part: Part): void
  onMouseLeave?(event: MouseEvent, part: Part): void
  MarkerProps?: MarkerProps
}

const Path: React.FC<PathProps> = (props) => {
  const {line, MarkerProps, onClick, onMouseDown, onMouseEnter, onMouseLeave} = props
  const {lines}: FlowchartEditorState = useStore((state) => state)
  const pathRef = useRef(null)
  const d: string = useMemo(() => {
    const transformedParts = line.parts.slice()
    const startPart = transformedParts.shift()
    const lastPart = transformedParts.pop() ?? startPart

    if (!startPart || !lastPart) return ''

    if (!Boolean(transformedParts.length)) {
      return `M ${startPart?.start.x} ${startPart?.start.y} L ${startPart?.end.x} ${startPart?.end.y} L ${lastPart?.end.x} ${lastPart?.end.y}`
    }

    return `M ${startPart?.start.x} ${startPart?.start.y} ${transformedParts.map(p => `L ${p.start.x} ${p.start.y} L ${p.end.x} ${p.end.y}`)} L ${lastPart?.end.x} ${lastPart?.end.y}`
  }, [line.parts])

  const [transformingPart, setTransformingPart] = useState<Part | undefined>()

  const cursor = useMemo(() => (transformingPart?.orientation === Orientation.Horizontal) ? 'row-resize' : 'col-resize', [transformingPart])

  const handleMouseEnter = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    const margin = 5
    const offsetX = event.offsetX
    const offsetY = event.offsetY
    const targetPart = line.parts.find(p => (offsetX >= (p.start.x - margin)) && (offsetX <= (p.end.x + margin)) && (offsetY >= (p.start.y - margin)) && (offsetY <= (p.end.y + margin)))
    const invertTargetPart = line.parts.find(p => (offsetX <= (p.start.x + margin)) && (offsetX >= (p.end.x - margin)) && (offsetY <= (p.start.y + margin)) && (offsetY >= (p.end.y - margin)))
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
    const targetPart = line.parts.find(p => (offsetX >= (p.start.x - margin)) && (offsetX <= (p.end.x + margin)) && (offsetY >= (p.start.y - margin)) && (offsetY <= (p.end.y + margin)))
    const invertTargetPart = line.parts.find(p => (offsetX <= (p.start.x + margin)) && (offsetX >= (p.end.x - margin)) && (offsetY <= (p.start.y + margin)) && (offsetY >= (p.end.y - margin)))
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
  }, [line.parts, transformingPart, lines])

  return (
    <path
      id={line.id}
      ref={pathRef}
      className={cc(['flowchart-editor_line-path', {['_selected']: line.state === LineStateNames.Selected}])}
      cursor={cursor}
      d={d}
      pointerEvents={'stroke'}
      markerEnd={`url(#${MarkerProps?.type ?? MarkerTypeNames.Arrow}${((line.state === LineStateNames.Updated) ? '-updating' : '')})`}
      data-id={line.id}
      data-element-type={ElementTypeNames.Path}
      data-source={line.source.handle?.node}
      data-target={line.target.handle?.node}
    />
  )
}

export default Path