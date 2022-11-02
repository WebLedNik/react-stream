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
import {LineStateNames, PartStateNames} from "../Line";

export interface NodeProps{
  node: NodeState
}
type NodePropsRef = HTMLDivElement
const Node = forwardRef<NodePropsRef, NodeProps>((props, ref) => {
  const {node} = props
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const {zoomTransformState, updateNodes, lines, updateLines}: FlowchartEditorState = useStore((state) => state)

  const setPositionNode = (nodePosition: NodeState['position']) => {
    if (!nodeRef || !nodeRef.current) return;

    const handles = nodeRef.current.querySelectorAll('.flowchart-editor_handle')
    if (!handles) return

    for (const handle of handles){
      const handleRelativePos = getRelativePosition({parent: nodeRef.current, child: (handle as HTMLDivElement)})

      const position = {
        x: nodePosition.x + (handle.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k),
        y: nodePosition.y + (handle.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)
      }

      lines.filter(line => line.source.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {

      })
      lines.filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
        const part = line.getEndPart()
        if (!part) return

        line.setState(LineStateNames.UpdatedByNode)
        line.setStatePart({part, state: PartStateNames.Updated})
        line.setPart({position})
      })
    }
  }
  const setPositionNodeByDelta = () => {
    if (!nodeRef || !nodeRef.current) return;

    const handles = nodeRef.current.querySelectorAll('.flowchart-editor_handle')
    if (!handles) return

    for (const handle of handles){
      const handleRelativePos = getRelativePosition({parent: nodeRef.current, child: (handle as HTMLDivElement)})

      const position = {
        x: node.position.x + (handle.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k),
        y: node.position.y + (handle.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)
      }

      lines.filter(line => line.source.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
        const part = line.getStartPart()
        if (!part) return

        if (part.orientation === Orientation.Horizontal){
          const delta = part.start.y - position.y

          if (delta === 0) return;
          updateNodes([{...node, position: {...node.position, y: node.position.y + delta}}])
        }

        if (part.orientation === Orientation.Vertical){
          const delta = part.start.x - position.x

          if (delta === 0) return;
          updateNodes([{...node, position: {...node.position, x: node.position.x + delta}}])
        }
      })
      lines.filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
        const part = line.getEndPart()
        if (!part) return

        if (part.orientation === Orientation.Horizontal){
          const delta = part.end.y - position.y

          if (delta === 0) return;
          updateNodes([{...node, position: {...node.position, y: node.position.y + delta}}])
        }

        if (part.orientation === Orientation.Vertical){
          const delta = part.end.x - position.x

          if (delta === 0) return;
          updateNodes([{...node, position: {...node.position, x: node.position.x + delta}}])
        }
      })
    }
  }

  const setPositionLines = (nodePosition: NodeState['position']) => {
    if (!nodeRef || !nodeRef.current) return;

    const handles = nodeRef.current.querySelectorAll('.flowchart-editor_handle')
    if (!handles) return

    for (const handle of handles){
      const handleRelativePos = getRelativePosition({parent: nodeRef.current, child: (handle as HTMLDivElement)})

      const position = {
        x: nodePosition.x + (handle.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k),
        y: nodePosition.y + (handle.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)
      }

      const sourceLines = lines.filter(line => line.source.handle?.id === (handle as HTMLElement).dataset.id)
      const targetLines = lines.filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)

      sourceLines?.map(line => {
        line.setSourcePosition(position)
      })
      targetLines?.map(line => {
        line.setTargetPosition(position)
      })
    }
  }

  const setTransformLines = () => {
    if (!nodeRef || !nodeRef.current) return;

    const handles = nodeRef.current.querySelectorAll('.flowchart-editor_handle')
    if (!handles) return

    for (const handle of handles){
      const handleRelativePos = getRelativePosition({parent: nodeRef.current, child: (handle as HTMLDivElement)})

      const position = {
        x: node.position.x + (handle.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k),
        y: node.position.y + (handle.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)
      }

      lines.filter(line => line.source.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
        line.setTransform({position})
      })
      lines.filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
        line.setTransform({position})
      })
    }
  }

  useEffect(() => {
    const selection = select(nodeRef.current)

    let startXPos: number = 0
    let startYPos: number = 0

    const dragBehavior = drag()
        .on('start', function (event, d){
          if (!node.drag) return

          startXPos = event.x
          startYPos = event.y
          selection.raise()
        })
        .on('drag', function (event, d){
          if (!node.drag) return

          const nodePosition: NodeState['position'] = {
            x: node.position.x - ((startXPos - event.x) / zoomTransformState.k),
            y: node.position.y - ((startYPos - event.y) / zoomTransformState.k)
          }

          selection.attr('style', getTransformTranslateStyle(nodePosition))

          // setPositionNode(nodePosition)
          updateNodes([{...node, position: nodePosition}])
          setPositionLines(nodePosition)
        })
        .on('end', function (event,d){
          if (!node.drag) return
          setTransformLines()
        })

    // @ts-ignore
    selection.call(dragBehavior)
  }, [zoomTransformState, node, lines])
  useEffect(() => {
    setPositionNodeByDelta()
  }, [node, lines, zoomTransformState])
  useEffect(() => {
    const selection = select(nodeRef.current)

    selection.attr('style', getTransformTranslateStyle(node.position))
  }, [node])

 return(
   <div className={'flowchart-editor_node'} ref={nodeRef} data-id={node.id} data-x={node.position.x} data-y={node.position.y}>
     Node {node.id}
     <Handle type={HandleTypeNames.Input} node={node} direction={Directions.Bottom}/>
     <Handle type={HandleTypeNames.Input} node={node} direction={Directions.Left}/>
     <Handle type={HandleTypeNames.Output} node={node} direction={Directions.Right}/>
     <Handle type={HandleTypeNames.Output} node={node} direction={Directions.Top}/>
   </div>
 )
})

Node.displayName = 'Node'
export default Node
export * from './utils'
export * from './types'