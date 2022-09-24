import * as React from 'react'
import {forwardRef, useEffect, useRef} from 'react'
import './style.css'
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import {drag} from "d3-drag";
import {NodeState} from "./types";
import {getRelativePosition, getTransformTranslateStyle} from "../../utils";
import Handle from "../Handle";
import {Part} from "../Line";
import {Orientation} from "../../types";

export interface NodeProps{
  node: NodeState
}
type NodePropsRef = HTMLDivElement
const Node = forwardRef<NodePropsRef, NodeProps>((props, ref) => {
  const {node} = props
  const nodeRef = useRef(null)
  const {zoomTransformState, updateNodes, lines, updateLines}: FlowchartEditorState = useStore((state) => state)

  const setPositionLines = (element: HTMLDivElement, elementPos: NodeState['position']) => {
    const handles = element.querySelectorAll('.flowchart-editor_handle')
    if (!handles) return

    for (const handle of handles){
      const handleRelativePos = getRelativePosition({parent: element, child: (handle as HTMLDivElement)})
      const position = {
        x: elementPos.x + (handle.clientWidth / 2) + (handleRelativePos.x / zoomTransformState.k),
        y: elementPos.y + (handle.clientHeight / 2) + (handleRelativePos.y / zoomTransformState.k)
      }
      const updatedSourceLines = lines.filter(line => line.source.id === (handle as HTMLElement).dataset.id)?.map(line => {
        const source = {...line.source, position}

        if (line.parts.length > 1){
          const firstPart: Part =  {
            ...line.parts[0],
            start: source.position,
            end: (line.parts[0].orientation === Orientation.Horizontal) ? {x: line.parts[0].end.x, y: source.position.y} : {x: source.position.x, y: line.parts[0].end.y}
          }
          const secondPart: Part = {
            ...line.parts[1],
            start: firstPart.end
          }

          const parts: Part[] = [firstPart, secondPart, ...line.parts.slice(2)]
          return {...line, parts, source}
        }

        const parts: Part[] = [
          {
            ...line.parts[0],
            start: source.position,
            end: (line.parts[0].orientation === Orientation.Horizontal) ? {x: line.parts[0].end.x, y: source.position.y} : {x: source.position.x, y: line.parts[0].end.y}
          },
          ...line.parts.slice(1)
        ]
        return {...line, parts, source}
      })
      const updatedTargetLines = lines.filter(line => line.target.id === (handle as HTMLElement).dataset.id)?.map(line => {
        const target = {...line.target, position}
        return {...line, target}
      })
      const payload = [...updatedSourceLines, ...updatedTargetLines]

      updateLines(payload)
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

        const payload: NodeState['position'] = {
          x: node.position.x - ((startXPos - event.x) / zoomTransformState.k),
          y: node.position.y - ((startYPos - event.y) / zoomTransformState.k)
        }

        selection.attr('style', getTransformTranslateStyle(payload))

        setPositionLines(event.sourceEvent.target, payload)
        updateNodes([{...node, position: payload}])
      })
      .on('end', function (event,d){
        if (!node.drag) return
      })

    // @ts-ignore
    selection.call(dragBehavior)
  }, [zoomTransformState, node, lines])

  useEffect(() => {
    const selection = select(nodeRef.current)

    selection.attr('style', getTransformTranslateStyle(node.position))
  }, [node])

 return(
   <div className={'flowchart-editor_node'} ref={nodeRef} data-id={node.id} data-x={node.position.x} data-y={node.position.y}>
     Node {node.id}
     <Handle node={node}/>
   </div>
 )
})

Node.displayName = 'Node'
export default Node
export * from './utils'
export * from './types'