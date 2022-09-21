import * as React from 'react'
import {forwardRef, PropsWithChildren} from "react";
import Background from "../Background";
import Wrapper from "./Wrapper";
import GraphView from "../GraphView";
import Controls from "../Controls";
import Map from "../Map";

export interface FlowchartEditorProps extends PropsWithChildren{}
export type FlowchartEditorRefProps = HTMLDivElement

const FlowchartEditor = forwardRef<FlowchartEditorRefProps, FlowchartEditorProps>(({children, ...props}, ref) => {
  return (
      <div className={'flowchart-editor'}>
      <Wrapper>
        <GraphView/>
        <Background/>
        <Controls/>
        {/*<Map/>*/}
      </Wrapper>
      </div>
  )
})

FlowchartEditor.displayName = 'FlowchartEditor'
export default FlowchartEditor