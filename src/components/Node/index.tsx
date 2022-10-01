import * as React from 'react'
import {forwardRef, useEffect, useRef} from 'react'
import {v4 as uuidv4} from 'uuid';
import './style.css'
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import {drag} from "d3-drag";
import {NodeState} from "./types";
import {getRelativePosition, getTransformTranslateStyle} from "../../utils";
import Handle from "../Handle";
import {Part} from "../Line";
import {Directions, Orientation} from "../../types";
import {HandleTypeNames} from "../Handle/types";

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
      const updatedSourceLines = lines.filter(line => line.source.handle.id === (handle as HTMLElement).dataset.id)?.map(line => {
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

        if (line.target.handle && line.target.position){
          const lastPart = line.parts[0]
          const firstNewPart: Part = {
            id: uuidv4(),
            orientation: lastPart.orientation,
            start: lastPart.start,
            end: (lastPart.orientation === Orientation.Horizontal) ? {
              x: lastPart.start.x + ((line.source.handle.direction === Directions.Right) ? 50 : -50),
              y: lastPart.start.y
            } : {
              x: lastPart.start.x,
              y: lastPart.start.y + ((line.source.handle.direction === Directions.Top) ? -50 : 50)
            }
          }
          const secondNewPart: Part = {
            id: uuidv4(),
            orientation: (firstNewPart.orientation === Orientation.Horizontal) ? Orientation.Vertical : Orientation.Horizontal,
            start: firstNewPart.end,
            end: (firstNewPart.orientation === Orientation.Horizontal) ? {
              x: firstNewPart.end.x,
              y: source.position.y
            } : {
              x: source.position.x,
              y: firstNewPart.end.y
            }
          }
          const parts: Part[] = [
            firstNewPart,
            secondNewPart,
            {
              ...lastPart,
              start: (lastPart.orientation === Orientation.Horizontal) ? {
                x: lastPart.end.x,
                y: line.target.position.y
              } : {
                x: line.target.position.x,
                y: lastPart.end.y
              },
              end: line.target.position
            }
          ]

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
      const updatedTargetLines = lines.filter(line => line.target.handle?.id === (handle as HTMLElement).dataset.id)?.map(line => {
        const target = {...line.target, position}

        if (line.parts.length > 1) {
          const lastPart = line.parts[line.parts.length - 1]
          const nextLastPart = line.parts[line.parts.length - 2]

          const parts: Part[] = [
            ...line.parts.slice(0, -2),
            {
              ...nextLastPart,
              end: (nextLastPart.orientation === Orientation.Horizontal) ? {
                x: target.position.x,
                y: nextLastPart.end.y
              } : {x: nextLastPart.end.x, y: target.position.y}
            },
            {
              ...lastPart,
              start: (lastPart.orientation === Orientation.Horizontal) ? {
                x: lastPart.start.x,
                y: target.position.y
              } : {x: target.position.x, y: lastPart.start.y},
              end: target.position
            }
          ]

          return {...line, parts, target}
        }

        const lastPart = line.parts[line.parts.length - 1]
        const firstNewPart: Part = {
          id: uuidv4(),
          orientation: lastPart.orientation,
          start: lastPart.start,
          end: (lastPart.orientation === Orientation.Horizontal) ? {
            x: lastPart.start.x + ((line.source.handle.direction === Directions.Right) ? 50 : -50),
            y: lastPart.start.y
          } : {
            x: lastPart.start.x,
            y: lastPart.start.y + ((line.source.handle.direction === Directions.Top) ? -50 : 50)
          }
        }
        const secondNewPart: Part = {
          id: uuidv4(),
          orientation: (firstNewPart.orientation === Orientation.Horizontal) ? Orientation.Vertical : Orientation.Horizontal,
          start: firstNewPart.end,
          end: (firstNewPart.orientation === Orientation.Horizontal) ? {
            x: firstNewPart.end.x,
            y: target.position.y
          } : {
            x: target.position.x,
            y: firstNewPart.end.y
          }
        }
        const parts: Part[] = [
          firstNewPart,
          secondNewPart,
          {
            ...lastPart,
            start: (lastPart.orientation === Orientation.Horizontal) ? {
              x: lastPart.start.x,
              y: target.position.y
            } : {
              x: target.position.x,
              y: lastPart.start.y
            },
            end: target.position
          }
        ]

        return {...line, parts, target}
      })
      // console.log({updatedTargetLines, lines, handle})
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
     <Handle type={HandleTypeNames.Output} node={node} direction={Directions.Bottom}/>
     <Handle type={HandleTypeNames.Output} node={node} direction={Directions.Right}/>
     <Handle type={HandleTypeNames.Input} node={node} direction={Directions.Left}/>
     <Handle type={HandleTypeNames.Input} node={node} direction={Directions.Top}/>
   </div>
 )
})

Node.displayName = 'Node'
export default Node
export * from './utils'
export * from './types'