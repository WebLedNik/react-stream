import * as React from 'react'
import './style.css'
import Node from "../Node";
import {FlowchartEditorState, useStore} from "../../store";

export interface NodeRendererProps{}
const NodeRenderer: React.FC<NodeRendererProps> = (props) => {
  const {nodes}:FlowchartEditorState = useStore((state) => state)

  return(
    <div className={'flowchart-editor_nodes'}>
      {nodes.map(node => <Node key={node.id} node={node}/>)}
    </div>
  )
}

NodeRenderer.displayName = 'NodeRenderer'
export default NodeRenderer