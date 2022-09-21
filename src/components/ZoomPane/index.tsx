import * as React from 'react'
import {PropsWithChildren, useEffect, useRef} from "react";
import './style.css'
import {select} from "d3-selection";
import {zoom, zoomTransform} from "d3-zoom";
import {FlowchartEditorState, useStore} from "../../store";

export interface ZoomPaneProps extends PropsWithChildren{}
const ZoomPane: React.FC<ZoomPaneProps> = ({children}) => {
  const refZoomPane = useRef(null)
  const {zoomTransformState, setZoomTransformState}: FlowchartEditorState = useStore((state) => state)

  useEffect(() => {
    const selection = select(refZoomPane.current)
    const zoomBehavior = zoom()
      .on('zoom', (event) => {
        const zoomState = event.transform
        setZoomTransformState(zoomState)
      })
    //@ts-ignore
    selection.call(zoomBehavior)
  }, [zoomTransformState])

  return(
    <>
      <div className={'flowchart-editor_zoom-pane'} ref={refZoomPane}>{children}</div>
    </>
  )
}

ZoomPane.displayName = 'ZoomPane'
export default ZoomPane

