import * as React from 'react'
import {forwardRef, useEffect, useRef, useState} from 'react'
import './style.css'
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import {drag} from "d3-drag";
import {NodeState} from "./types";
import {getRelativePosition, getTransformTranslateStyle} from "../../utils";
import Handle, {HandleTypeNames} from "../Handle";
import {Directions, Position} from "../../types";
import {setLineSourcePosition, setLineTargetPosition} from "../Line";
import shallow from "zustand/shallow";

export interface NodeProps {
  node: NodeState
}

type NodePropsRef = HTMLDivElement
const Node = forwardRef<NodePropsRef, NodeProps>((props, ref) => {
  const {node} = props
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const {
    zoomTransformState,
    updateNodes,
    updateLines,
    lines
  } = useStore((state: FlowchartEditorState) => ({
    zoomTransformState: state.zoomTransformState,
    updateNodes: state.updateNodes,
    updateLines: state.updateLines,
    lines: state.lines
  }), shallow)

  const setPositionLines = (node: NodeState) => {
    if (!nodeRef || !nodeRef.current) return;

    const handles = nodeRef.current!.querySelectorAll('.flowchart-editor_handle')
    if (!handles) return

    for (const handle of handles) {
      const handleRelativePos = getRelativePosition({parent: nodeRef.current!, child: (handle as HTMLDivElement)})

      const position = {
        x: node.position.x + (handle.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k),
        y: node.position.y + (handle.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)
      }

      const sourceLines = lines.filter(line => line.source.handle?.id === (handle as HTMLElement).dataset.id)
      const targetLines = lines.filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)

      sourceLines?.map(line => {
        const payload = setLineSourcePosition({currentLine: line, position})
        if (!payload) return

        updateLines([payload])
      })
      targetLines?.map(line => {
        const payload = setLineTargetPosition({currentLine: line, position})
        if (!payload) return

        updateLines([payload])
      })
    }
  }

  useEffect(() => {
    const selection = select(nodeRef.current)

    let startXPos: number = 0
    let startYPos: number = 0

    const dragBehavior = drag()
      .on('start', function (event, d) {
        if (!node.drag) return

        startXPos = event.x
        startYPos = event.y
        selection.raise()
      })
      .on('drag', function (event, d) {
        if (!node.drag) return

        const nodePosition: Position = {
          x: node.position.x - ((startXPos - event.x) / zoomTransformState.k),
          y: node.position.y - ((startYPos - event.y) / zoomTransformState.k)
        }

        selection.style('transform', getTransformTranslateStyle(nodePosition))
        setPositionLines({...node, position: nodePosition})
      })
      .on('end', function (event, d) {
        if (!node.drag) return

        const nodePosition: Position = {
          x: node.position.x - ((startXPos - event.x) / zoomTransformState.k),
          y: node.position.y - ((startYPos - event.y) / zoomTransformState.k)
        }

        updateNodes([{...node, position: nodePosition}])
      })

    // @ts-ignore
    selection.call(dragBehavior)
  }, [zoomTransformState, node, lines])

  return (
      <div
        className={'flowchart-editor_node'}
        ref={nodeRef}
        data-id={node.id}
        data-x={node.position.x}
        data-y={node.position.y}
        style={{
          width: node.width,
          height: node.height
        }}
      >
        Node {node.id}
        <Handle type={HandleTypeNames.Input} node={node} direction={Directions.Bottom}/>
        <Handle type={HandleTypeNames.Input} node={node} direction={Directions.Left}/>
        <Handle type={HandleTypeNames.Output} node={node} direction={Directions.Right}/>
        <Handle type={HandleTypeNames.Output} node={node} direction={Directions.Top}/>
      </div>
  )
})

Node.displayName = 'FlowchartNode'
export default React.memo(Node)

export * from './utils'
export * from './types'