import * as React from 'react'
import cc from "classcat"
import './style.css'
import {Directions, ElementTypeNames} from "../../types";
import {HandleTypeNames} from "./types";

interface HandleProps {
  id: string
  type: HandleTypeNames
  direction: Directions
}

const Handle: React.FC<HandleProps> = (props) => {
  const {id, type, direction} = props

  return (
    <div
      className={cc([
        'flowchart-editor_handle',
        {
          ['_top']: direction === Directions.Top,
          ['_right']: direction === Directions.Right,
          ['_left']: direction === Directions.Left,
          ['_bottom']: direction === Directions.Bottom,
          ['_input']: type === HandleTypeNames.Input,
          ['_output']: type === HandleTypeNames.Output
        }
      ])}
      data-id={id}
      data-element-type={ElementTypeNames.Handle}
      data-handle-type={type}
      data-direction={direction}
    >
    </div>
  )
}

Handle.displayName = 'FlowchartHandle'
export default Handle
export * from './types'
export * from './utils'
