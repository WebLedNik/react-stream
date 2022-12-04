import * as React from 'react'
import './style.css'
import Node, {NodeState} from "../Node";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";
import {ElementTypeNames} from "../../types";
import {LineState} from "../Line";

export interface NodeRendererProps{
  onLinesChange?: (lines: LineState[], isCreate?: boolean) => void
  onNodesChange?:(nodes: NodeState[]) => void
  onNodeDragStop?:(nodes: NodeState[]) => void
}
const NodeRenderer: React.FC<NodeRendererProps> = (props) => {
  const {
    onNodesChange,
    onNodeDragStop,
    onLinesChange
  } = props
  const nodes = useStore((state: FlowchartEditorState) => state.nodes, shallow)
  return(
    <div className={'flowchart-editor_nodes'} data-element-type={ElementTypeNames.EditorNodes}>
      {nodes.map(node => <Node key={node.id} node={node} onNodesChange={onNodesChange} onNodeDragStop={onNodeDragStop} onLinesChange={onLinesChange}/>)}
    </div>
  )
}

NodeRenderer.displayName = 'FlowchartNodeRenderer'
export default NodeRenderer