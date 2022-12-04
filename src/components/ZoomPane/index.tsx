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
  onDoubleClick?:(event: MouseEvent) => void
}

const ZoomPane: React.FC<ZoomPaneProps> = ({children, ...props}) => {
  const {onDoubleClick} = props
  const refZoomPane = useRef(null)
  const {
    zoomTransformState,
    setZoomTransformState,
    nodes,
    lines,
    updateLines
  }: FlowchartEditorState = useStore((state) => state)

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
  const handleDoubleClick = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    onDoubleClick && onDoubleClick(event)
  }

  useEventListener("mouseup", handleMouseUp, refZoomPane)
  useEventListener("mousemove", handleMouseMove, refZoomPane)
  useEventListener("dblclick", handleDoubleClick, refZoomPane)
  useEffect(() => {
    const selection = select(refZoomPane.current)

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
        const RIGTH_MOUSE_BTN = 2
        if (event.button === RIGTH_MOUSE_BTN) return false
        return true
      })
    //@ts-ignore
    selection.call(zoomBehavior)
    selection.on("dblclick.zoom", null);
    selection.on("dblclick.click", null);
  }, [zoomTransformState, nodes, lines])

  return (
    <>
      <div className={'flowchart-editor_zoom-pane'} ref={refZoomPane}>{children}</div>
    </>
  )
}

ZoomPane.displayName = 'FlowchartZoomPane'
export default ZoomPane

