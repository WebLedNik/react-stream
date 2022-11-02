import * as React from "react";
import {PropsWithChildren, useEffect} from "react";
import { Provider, createStore } from "../../store";
import './style.css'

export interface WrapperProps extends PropsWithChildren{}
const Wrapper: React.FC<WrapperProps> = ({children}) => {
  return(
    // @ts-ignore
    <Provider createStore={createStore}>{children}</Provider>
  )
}

Wrapper.displayName = 'FlowchartEditorWrapper'
export default Wrapper