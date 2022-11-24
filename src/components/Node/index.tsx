import * as React from 'react'
import {forwardRef, useEffect, useRef} from 'react'
import './style.css'
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import {drag} from "d3-drag";
import {NodeState} from "./types";
import {getRelativePosition, getTransformTranslateStyle} from "../../utils";
import Handle, {HandleTypeNames} from "../Handle";
import {Directions, Orientation} from "../../types";
import {getEndPart, getStartPart, setLineSourcePosition, setLineTargetPosition, setLineTransform} from "../Line";
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
    updateLines
  } = useStore((state: FlowchartEditorState) => ({
    zoomTransformState: state.zoomTransformState,
    updateNodes: state.updateNodes,
    updateLines: state.updateLines
  }), shallow)

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    //updateNodes([{...node, state: node.state === NodeStateNames.Selected ? NodeStateNames.Fixed : NodeStateNames.Selected}])
  }

  // const setPositionNode = (nodePosition: NodeState['position']) => {
  //   if (!nodeRef || !nodeRef.current) return;
  //
  //   const handles = nodeRef.current!.querySelectorAll('.flowchart-editor_handle')
  //   if (!handles) return
  //
  //   for (const handle of handles) {
  //     const handleRelativePos = getRelativePosition({parent: nodeRef.current!, child: (handle as HTMLDivElement)})
  //
  //     const position = {
  //       x: nodePosition.x + (handle.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k),
  //       y: nodePosition.y + (handle.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)
  //     }
  //
  //     lines.filter(line => line.source.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
  //
  //     })
  //     lines.filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
  //       const part = getEndPart(line.parts)
  //       if (!part) return
  //
  //       line.setState(LineStateNames.UpdatedByNode)
  //       line.setStatePart({part, state: PartStateNames.Updated})
  //       line.setPart({position})
  //     })
  //   }
  // }
  // const setPositionNodeByDelta = () => {
  //   if (!nodeRef || !nodeRef.current) return;
  //
  //   const handles = nodeRef.current!.querySelectorAll('.flowchart-editor_handle')
  //   if (!handles) return
  //
  //   for (const handle of handles) {
  //     const handleRelativePos = getRelativePosition({parent: nodeRef.current!, child: (handle as HTMLDivElement)})
  //
  //     const position = {
  //       x: node.position.x + (handle.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k),
  //       y: node.position.y + (handle.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)
  //     }
  //
  //     node.lines.map(({line}) => line).filter(line => line.source.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
  //       const part = getStartPart(line.parts)
  //       if (!part) return
  //
  //       if (part.orientation === Orientation.Horizontal) {
  //         const delta = part.start.y - position.y
  //
  //         if (delta === 0) return;
  //         updateNodes([{...node, position: {...node.position, y: node.position.y + delta}}])
  //       }
  //
  //       if (part.orientation === Orientation.Vertical) {
  //         const delta = part.start.x - position.x
  //
  //         if (delta === 0) return;
  //         updateNodes([{...node, position: {...node.position, x: node.position.x + delta}}])
  //       }
  //     })
  //     node.lines.map(({line}) => line).filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
  //       const part = getEndPart(line.parts)
  //       if (!part) return
  //
  //       if (part.orientation === Orientation.Horizontal) {
  //         const delta = part.end.y - position.y
  //
  //         if (delta === 0) return;
  //         updateNodes([{...node, position: {...node.position, y: node.position.y + delta}}])
  //       }
  //
  //       if (part.orientation === Orientation.Vertical) {
  //         const delta = part.end.x - position.x
  //
  //         if (delta === 0) return;
  //         updateNodes([{...node, position: {...node.position, x: node.position.x + delta}}])
  //       }
  //     })
  //   }
  // }
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

      const sourceLines = node.lines.filter(line => line.source.handle?.id === (handle as HTMLElement).dataset.id)
      const targetLines = node.lines.filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)

      sourceLines?.map(line => {
        const payload = setLineSourcePosition({currentLine: line, position})
        if (!payload) return

        updateLines([payload])
        updateNodes([{...node, lines: node.lines.map((l => {
          if (l.id === payload.id) return {...l, ...payload}
          return l
        }))}])
      })
      targetLines?.map(line => {
        const payload = setLineTargetPosition({currentLine: line, position})
        if (!payload) return

        updateLines([payload])
        updateNodes([{...node, lines: node.lines.map((l => {
            if (l.id === payload.id) return {...l, ...payload}
            return l
          }))}])
      })
    }
  }
  const setTransformLines = (node: NodeState) => {
    if (!nodeRef || !nodeRef.current) return;

    const handles = nodeRef.current!.querySelectorAll('.flowchart-editor_handle')
    if (!handles) return

    for (const handle of handles) {
      const handleRelativePos = getRelativePosition({parent: nodeRef.current!, child: (handle as HTMLDivElement)})

      const position = {
        x: node.position.x + (handle.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k),
        y: node.position.y + (handle.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)
      }

      node.lines.filter(line => line.source.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
        // const payload = setLineTransform({line, position})
        // payload && updateLines([payload])
      })
      node.lines.filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
        const payload = setLineTransform({line, position})
        if (!payload) return
        console.log({payload})
        updateLines([payload])
        updateNodes([{...node, lines: node.lines.map((l => {
            if (l.id === payload.id) return {...l, ...payload}
            return l
          }))}])
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

        const nodePosition: NodeState['position'] = {
          x: node.position.x - ((startXPos - event.x) / zoomTransformState.k),
          y: node.position.y - ((startYPos - event.y) / zoomTransformState.k)
        }

        selection.style('transform', getTransformTranslateStyle(nodePosition))
        setPositionLines({...node, position: nodePosition})
      })
      .on('end', function (event, d) {
        if (!node.drag) return

        const nodePosition: NodeState['position'] = {
          x: node.position.x - ((startXPos - event.x) / zoomTransformState.k),
          y: node.position.y - ((startYPos - event.y) / zoomTransformState.k)
        }

        setTransformLines({...node, position: nodePosition})
        updateNodes([{...node, position: nodePosition}])
      })

    // @ts-ignore
    selection.call(dragBehavior)
  }, [zoomTransformState, node])
  // useEffect(() => {
  //   setPositionNodeByDelta()
  // }, [node, zoomTransformState])
  // useEffect(() => {
  //   const selection = select(nodeRef.current)
  //
  //   selection.style('transform', getTransformTranslateStyle(node.position))
  // }, [node])

  console.log('Node', {props})

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
      onClick={handleClick}
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