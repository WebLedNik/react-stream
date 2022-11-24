import * as React from 'react'
import {LineState} from "./types";
import {PropsWithChildren} from "react";
import {FlowchartEditorState, useStore} from "../../store";
import Content from "./Content";

interface WrapperProps extends PropsWithChildren{
  line: LineState
}

const Wrapper: React.FC<WrapperProps> = (props) => {
  const {line, children} = props
  const {zoomTransformState}: FlowchartEditorState = useStore((state) => state)

  console.log('WrapperLine', {line})
  return(
    <Content line={line} zoomTransformState={zoomTransformState}/>
  )
}

Wrapper.displayName = 'FlowchartLine'
export default Wrapper