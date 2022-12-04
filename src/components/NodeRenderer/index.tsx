import * as React from 'react'
import './style.css'
import Node, {NodeState} from "../Node";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";

export interface NodeRendererProps{
  onNodesChange?:(nodes: NodeState[]) => void
  onNodeDragStop?:(nodes: NodeState[]) => void
}
const NodeRenderer: React.FC<NodeRendererProps> = (props) => {
  const {onNodesChange, onNodeDragStop} = props
  const nodes = useStore((state: FlowchartEditorState) => state.nodes, shallow)
  return(
    <div className={'flowchart-editor_nodes'}>
      {nodes.map(node => <Node key={node.id} node={node} onNodesChange={onNodesChange} onNodeDragStop={onNodeDragStop}/>)}
    </div>
  )
}

NodeRenderer.displayName = 'FlowchartNodeRenderer'
export default NodeRenderer