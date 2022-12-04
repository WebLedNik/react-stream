import * as React from 'react'
import {forwardRef, PropsWithChildren, useEffect} from "react";
import Wrapper from "./Wrapper";
import GraphView from "../GraphView";
import Controls from "../Controls";
import SelectionArea from "../SelectionArea";
import {NodeState} from "../Node";
import {LineDTO, LineState} from "../Line";
import StoreUpdater from "../StoreUpdater";
import {NodeTypes} from "../../store";
import ConnectionManagement from "../ConnectionManagement";
import KeyManagement from "../KeyManagement";

export interface FlowchartEditorProps extends PropsWithChildren {
  nodes?: NodeState[]
  lines?: LineState[]
  nodeTypes?: NodeTypes
  onConnect?: (line: LineState) => void
  onNodesChange?:(nodes: NodeState[]) => void
  onLinesChange?:(lines: LineState[], isCreate?: boolean) => void
  onNodeDragStop?:(nodes: NodeState[]) => void
  onDoubleClick?:(event: MouseEvent) => void
  onNodesDelete?: (nodes: NodeState[]) => void
  onLinesDelete?: (nodes: LineState[]) => void
}

export type FlowchartEditorRefProps = HTMLDivElement

const FlowchartEditor = forwardRef<FlowchartEditorRefProps, FlowchartEditorProps>(({children, ...props}, ref) => {
  const {
    nodes,
    lines,
    nodeTypes,
    onDoubleClick,
    onNodesChange,
    onNodeDragStop,
    onConnect,
    onLinesChange,
    onNodesDelete,
    onLinesDelete
  } = props

  return (
      <div className={'flowchart-editor'}>
        <Wrapper>
          {children}
          <GraphView
            onDoubleClickZoomPane={onDoubleClick}
            onNodeDragStop={onNodeDragStop}
            onNodesChange={onNodesChange}
            onLinesChange={onLinesChange}
          />
          <SelectionArea
            onNodesChange={onNodesChange}
            onLinesChange={onLinesChange}
          />
          <KeyManagement
            onNodesDelete={onNodesDelete}
            onLinesDelete={onLinesDelete}
          />
          <ConnectionManagement
            onConnect={onConnect}
            onLinesChange={onLinesChange}
          />
          <StoreUpdater
            nodes={nodes}
            lines={lines}
            nodeTypes={nodeTypes}
          />
        </Wrapper>
      </div>
  )
})

FlowchartEditor.displayName = 'FlowchartEditor'
export default FlowchartEditor

export * from './types'