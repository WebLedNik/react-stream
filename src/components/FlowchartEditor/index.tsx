import * as React from 'react'
import {forwardRef, PropsWithChildren, useEffect} from "react";
import Background from "../Background";
import Wrapper from "./Wrapper";
import GraphView from "../GraphView";
import Controls from "../Controls";
import SelectionArea from "../SelectionArea";
import {NodeState} from "../Node";
import {LineState} from "../Line";
import StoreUpdater from "../StoreUpdater";
import {NodeTypes} from "../../store";

export interface FlowchartEditorProps extends PropsWithChildren {
  nodes?: NodeState[]
  lines?: LineState[]
  nodeTypes?: NodeTypes
  onNodesChange?:(nodes: NodeState[]) => void
  onNodeDragStop?:(nodes: NodeState[]) => void
  onDoubleClick?:(event: MouseEvent) => void
}

export type FlowchartEditorRefProps = HTMLDivElement

const FlowchartEditor = forwardRef<FlowchartEditorRefProps, FlowchartEditorProps>(({children, ...props}, ref) => {
  const {
    nodes,
    lines,
    nodeTypes,
    onDoubleClick,
    onNodesChange,
    onNodeDragStop
  } = props

  return (
      <div className={'flowchart-editor'}>
        <Wrapper>
          <GraphView
            onDoubleClickZoomPane={onDoubleClick}
            onNodeDragStop={onNodeDragStop}
            onNodesChange={onNodesChange}
          />
          <Background/>
          <Controls/>
          <SelectionArea onNodesChange={onNodesChange}/>
          <StoreUpdater
            nodes={nodes}
            nodeTypes={nodeTypes}
          />
          {/*<Map/>*/}
        </Wrapper>
      </div>
  )
})

FlowchartEditor.displayName = 'FlowchartEditor'
export default FlowchartEditor

export * from './types'