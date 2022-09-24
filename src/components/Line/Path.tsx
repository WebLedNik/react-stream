import * as React from "react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import cc from "classcat"
import {Part} from "./types";
import {Orientation} from "../../types";
import {select} from "d3-selection";

export interface PathProps {
  parts: Part[]
  onClick?(event: React.MouseEvent): void
  onMouseDown?(event: React.MouseEvent, part: Part): void
  updating?: boolean
  selected?: boolean
}

const Path: React.FC<PathProps> = (props) => {
  const {parts, updating, selected, onClick, onMouseDown} = props
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

  const handleMouseOver = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    const margin = 5
    const offsetX = event.offsetX
    const offsetY = event.offsetY
    const targetPart = parts.find(p => (offsetX >= (p.start.x - margin)) && (offsetX <= (p.end.x + margin)) && (offsetY >= (p.start.y - margin)) && (offsetY <= (p.end.y + margin)))
    const invertTargetPart = parts.find(p => (offsetX <= (p.start.x + margin)) && (offsetX >= (p.end.x - margin)) && (offsetY <= (p.start.y + margin)) && (offsetY >= (p.end.y - margin)))

    return setTransformingPart(targetPart ?? invertTargetPart)


  }

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation()

    onClick && onClick(event)
  }

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation()

    onMouseDown && transformingPart && onMouseDown(event, transformingPart)
  }

  useEffect(() => {
    const selection = select(pathRef.current)

    selection.on('mousedown', handleMouseDown)
    selection.on('mouseover', handleMouseOver)
    selection.on('click', handleClick)
  }, [parts, transformingPart])

  return (
    <path
      ref={pathRef}
      className={cc(['flowchart-editor_line-path', {['_updating']: updating, ['_selected']: selected}])}
      d={d}
      pointerEvents={'stroke'}
      markerEnd={updating ? 'url(#handle-line-target-updating)' : 'url(#handle-line-target)'}
      onClick={handleClick}
      cursor={cursor}
    />
  )
}

export default Path