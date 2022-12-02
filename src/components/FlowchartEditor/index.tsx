import * as React from 'react'
import {forwardRef, PropsWithChildren, useEffect} from "react";
import Background from "../Background";
import Wrapper from "./Wrapper";
import GraphView from "../GraphView";
import Controls from "../Controls";
import SelectionArea from "../SelectionArea";

export interface FlowchartEditorProps extends PropsWithChildren {
  onDoubleClick?:(event: MouseEvent) => void
}

export type FlowchartEditorRefProps = HTMLDivElement

const FlowchartEditor = forwardRef<FlowchartEditorRefProps, FlowchartEditorProps>(({children, ...props}, ref) => {
  const {onDoubleClick} = props
  return (
      <div className={'flowchart-editor'}>
        <Wrapper>
          <GraphView onDoubleClickZoomPane={onDoubleClick}/>
          <Background/>
          <Controls/>
          <SelectionArea/>
          {/*<Map/>*/}
        </Wrapper>
      </div>
  )
})

FlowchartEditor.displayName = 'FlowchartEditor'
export default FlowchartEditor

export * from './types'