import * as React from 'react'
import cc from "classcat";
import {Directions, Orientation, Position} from "../../types";
import {PathValues} from "./types";
import {useMemo} from "react";
import {getOrientation} from "../../utils";

interface PathProps{
  path: PathValues,
  mousePosition: Position | null
}
const Path: React.FC<PathProps> = (props) => {
  const {path, mousePosition} = props
  const orientation = getOrientation(path.direction)
  const moveTo = useMemo(() => path.moveTo, [path, mousePosition])
  const lineTo = useMemo(() => ({
    x: (orientation === Orientation.Vertical) ? path.moveTo.x : mousePosition?.x ?? path.lineTo.x,
    y: (orientation === Orientation.Horizontal) ? path.moveTo.y : mousePosition?.y ?? path.lineTo.y
  }), [path, mousePosition])


  return(
    <>
      <path
        key={path.id}
        className={cc([
          'flowchart-editor_line-path'
        ])}
        d={`M ${moveTo.x} ${moveTo.y} ${((path.direction) === Directions.Left || (path.direction) === Directions.Right) ? `H ${lineTo.x}` : ''} ${((path.direction) === Directions.Bottom || (path.direction) === Directions.Top) ? `V ${lineTo.y}` : ''} L ${lineTo.x} ${lineTo.y}`}
      />
    </>
  )
}

export default Path