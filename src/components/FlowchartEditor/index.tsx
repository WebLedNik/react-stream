import * as React from 'react'
import {forwardRef} from "react";

export interface ReactStreamProps{}
export type ReactStreamRefProps = HTMLDivElement
const ReactStream = forwardRef<ReactStreamRefProps, ReactStreamProps>((props, ref) => {
  return(
    <>
    </>
  )
})

ReactStream.displayName = 'ReactStream'
export default ReactStream