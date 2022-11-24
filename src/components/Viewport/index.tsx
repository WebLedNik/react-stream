import * as React from 'react'
import {PropsWithChildren, useEffect, useRef} from "react";
import './style.css'
import {FlowchartEditorState, useStore} from "../../store";
import {select} from "d3-selection";
import {getTransformTranslateScaleStyle} from "../../utils";

interface ViewportProps extends PropsWithChildren{}
const Viewport: React.FC<ViewportProps> = ({children, ...props}) => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const {zoomTransformState, setWidthHeightViewport}:FlowchartEditorState = useStore((state) => state)

  useEffect(() => {
    const selection = select(viewportRef.current)
    const transformWidth = Number(viewportRef.current?.clientWidth) * zoomTransformState.k
    const transformHeight = Number(viewportRef.current?.clientHeight) * zoomTransformState.k

    selection.attr('style', getTransformTranslateScaleStyle(zoomTransformState))
    setWidthHeightViewport(transformWidth, transformHeight)
  }, [zoomTransformState])


  return (
    <div ref={viewportRef} className={'flowchart-editor_viewport'}>{children}</div>
  )
}

Viewport.displayName = 'FlowchartViewport'
export default Viewport