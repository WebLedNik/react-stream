import * as React from 'react'
import {forwardRef, PropsWithChildren} from 'react'
import Wrapper from "./Wrapper";
import GraphView from "../GraphView";
import SelectionArea from "../SelectionArea";
import {NodeState} from "../Node";
import {LineState} from "../Line";
import StoreUpdater from "../StoreUpdater";
import {NodeTypes} from "../../store";
import EventsManagement from "../EventsManagement";
import KeyManagement from "../KeyManagement";

export interface FlowchartEditorProps extends PropsWithChildren {
  nodes?: NodeState[]
  lines?: LineState[]
  nodeTypes?: NodeTypes
  onConnect?: (line: LineState) => void
  onDoubleClick?:(event: MouseEvent) => void
  onNodesChange?:(nodes: NodeState[]) => void
  onLinesChange?:(lines: LineState[], isCreate?: boolean) => void
  onNodesDelete?: (nodes: NodeState[]) => void
  onLinesDelete?: (lines: LineState[]) => void
  onNodeDragStop?:(nodes: NodeState[]) => void
  onNodeContextMenu?: (event: MouseEvent, element: HTMLElement) => void
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
    onLinesDelete,
    onNodeContextMenu
  } = props

  return (
      <div className={'flowchart-editor'}>
        <Wrapper>
          {children}
          <GraphView
            onNodeDragStop={onNodeDragStop}
            onNodesChange={onNodesChange}
            onLinesChange={onLinesChange}
            onNodeContextMenu={onNodeContextMenu}
          />
          <SelectionArea
            onNodesChange={onNodesChange}
            onLinesChange={onLinesChange}
          />
          <KeyManagement
            onNodesDelete={onNodesDelete}
            onLinesDelete={onLinesDelete}
          />
          <EventsManagement
            onConnect={onConnect}
            onLinesChange={onLinesChange}
            onNodesChange={onNodesChange}
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