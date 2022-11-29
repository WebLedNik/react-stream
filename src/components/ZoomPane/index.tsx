import * as React from 'react'
import {PropsWithChildren, useEffect, useRef} from 'react'
import './style.css'
import {select} from "d3-selection";
import {zoom} from "d3-zoom";
import {FlowchartEditorState, useStore} from "../../store";
import {getRootElement} from "../../utils";
import {NodeStateNames} from "../Node";
import {getIsLineModified, LineStateNames, setLinePart, setLineState, setLineTransform} from "../Line";
import useEventListener from "../../hooks/useEventListener";

export interface ZoomPaneProps extends PropsWithChildren {
}

const ZoomPane: React.FC<ZoomPaneProps> = ({children}) => {
  const refZoomPane = useRef(null)
  const {zoomTransformState, setZoomTransformState, nodes, lines, updateNodes, updateLines}: FlowchartEditorState = useStore((state) => state)

  const handleMouseUp = (event: MouseEvent) => {
    event.preventDefault()

    const line = lines.find(l => getIsLineModified(l.state))
    if (!line) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    const payload = setLineTransform({line: line, position: {x, y}})
    updateLines([payload])
  }
  const handleMouseMove = (event: MouseEvent) => {
    event.preventDefault()

    const line = lines.find(l => getIsLineModified(l.state))
    if (!line) return

    const x = (event.x - zoomTransformState.x) / zoomTransformState.k
    const y = (event.y - zoomTransformState.y) / zoomTransformState.k

    const payload = setLinePart({currentLine: line, position: {x, y}})
    payload && updateLines([payload])
  }

  useEventListener("mouseup", handleMouseUp, refZoomPane)
  useEventListener("mousemove", handleMouseMove, refZoomPane)
  useEffect(() => {
    const selection = select(refZoomPane.current)

    // selection.on('click', (event) => {
    //   const LEFT_MOUSE_BTN = 0
    //
    //   // Сброс выделенных объектов
    //   if (event.button === LEFT_MOUSE_BTN){
    //     updateNodes(nodes.map(n => ({...n, state: NodeStateNames.Fixed})))
    //     updateLines(lines.map(l => setLineState({line: l, state: LineStateNames.Fixed})))
    //   }
    // })

    const zoomBehavior = zoom()
      .on('start', (event) => {
        const editorElement = getRootElement()
        if (!editorElement) return

        if (event.sourceEvent.wheelDelta) return

        editorElement.style.cursor = 'move'
      })
      .on('zoom', (event) => {
      const zoomState = event.transform
      setZoomTransformState(zoomState)
    })
      .on('end', (event) => {
        const editorElement = getRootElement()
        if (!editorElement) return

        editorElement.style.cursor = 'default'
      })
      .filter((event) => {
        if (event.wheelDelta) return true
      const MIDDLE_MOUSE_BTN = 1
      return event.button === MIDDLE_MOUSE_BTN
    })
    //@ts-ignore
    selection.call(zoomBehavior)
  }, [zoomTransformState, nodes, lines])

  return (
    <>
      <div className={'flowchart-editor_zoom-pane'} ref={refZoomPane}>{children}</div>
    </>
  )
}

ZoomPane.displayName = 'FlowchartZoomPane'
export default ZoomPane

