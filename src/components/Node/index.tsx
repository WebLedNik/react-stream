import * as React from 'react'
import {PropsWithChildren, useEffect, useMemo, useRef, useState} from 'react'
import './style.css'
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import {drag} from "d3-drag";
import {NodeState, NodeStateNames} from "./types";
import {getRelativePosition, getTransformTranslateStyle} from "../../utils";
import {Position, SizeProps} from "../../types";
import {setLineSourcePosition, setLineTargetPosition} from "../Line";
import shallow from "zustand/shallow";
import Moveable from "react-moveable";

export interface NodeProps extends PropsWithChildren{
  node: NodeState
  onNodesChange?: (nodes: NodeState[]) => void
  onNodeDragStop?: (nodes: NodeState[]) => void
}


const Node:React.FC<NodeProps> = (props) => {
  const {
    node,
    onNodesChange,
    onNodeDragStop
  } = props
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const {
    zoomTransformState,
    updateLines,
    lines,
    nodeTypes
  } = useStore((state: FlowchartEditorState) => ({
    zoomTransformState: state.zoomTransformState,
    updateLines: state.updateLines,
    lines: state.lines,
    nodeTypes: state.nodeTypes
  }), shallow)

  const nodeComponent = useMemo(() => nodeTypes[node.type] ?? <></>, [node.type])

  const [target, setTarget] = useState<HTMLDivElement | null | undefined>();

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const payload = {...node, state: NodeStateNames.Selected}

    onNodesChange && onNodesChange([payload])
  }

  const handleResizeEnd = (size: SizeProps) => {
    const payload = {...node, ...size}

    onNodesChange && onNodesChange([payload])
  }

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

    const dragBehavior = drag()
      .on('start', function (event, d) {
        if (!node.drag) return
        selection.raise()
      })
      .on('drag', function (event, d) {
        if (!node.drag) return

        const nodePosition: Position = {
          x: (node.position.x - (event.subject.x / zoomTransformState.k)) + (event.x / zoomTransformState.k),
          y: (node.position.y - (event.subject.y / zoomTransformState.k)) + (event.y / zoomTransformState.k),
        }

        selection.style('transform', getTransformTranslateStyle(nodePosition))
        setPositionLines({...node, position: nodePosition})
      })
      .on('end', function (event, d) {
        if (!node.drag) return

        const nodePosition: Position = {
          x: (node.position.x - (event.subject.x / zoomTransformState.k)) + (event.x / zoomTransformState.k),
          y: (node.position.y - (event.subject.y / zoomTransformState.k)) + (event.y / zoomTransformState.k),
        }

        const payload = {...node, position: nodePosition}

        onNodeDragStop && onNodeDragStop([payload])
      })

    // @ts-ignore
    selection.call(dragBehavior)
  }, [zoomTransformState, node, lines])
  useEffect(() => {
    setTarget(nodeRef.current);
  }, [node, nodeRef]);
  useEffect(() => {
    setPositionLines(node)
  }, [node.width, node.height])

  return (
    <div
      className={'flowchart-editor_node'}
      ref={nodeRef}
      data-id={node.id}
      data-x={node.position.x}
      data-y={node.position.y}
      style={{
        width: node.width,
        height: node.height,
        transform: getTransformTranslateStyle(node.position)
      }}
      onClick={handleClick}
    >
      {/*Node {node.id}*/}
      <>
        {nodeComponent}
      </>
      {/*<Handle type={HandleTypeNames.Input} node={node} direction={Directions.Bottom}/>*/}
      {/*<Handle type={HandleTypeNames.Input} node={node} direction={Directions.Left}/>*/}
      {/*<Handle type={HandleTypeNames.Output} node={node} direction={Directions.Right}/>*/}
      {/*<Handle type={HandleTypeNames.Output} node={node} direction={Directions.Top}/>*/}
      {node.state === NodeStateNames.Selected &&
          <Moveable
              target={target}
              resizable={true}
              renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
              throttleResize={20}
              origin={false}
              padding={{left: 4, top: 4, right: 4, bottom: 4}}
              onResize={({target, width, height, delta}) => {
                delta[0] && (target!.style.width = `${width}px`);
                delta[1] && (target!.style.height = `${height}px`);
              }}
              onResizeEnd={({target}) => {
                handleResizeEnd({width: target.clientWidth, height: target.clientHeight})
              }}
          />
      }
    </div>
  )
}

Node.displayName = 'FlowchartNode'
export default Node

export * from './types'
export * from './utils'