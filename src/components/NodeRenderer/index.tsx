import * as React from 'react'
import './style.css'
import Node, {NodeState} from "../Node";
import {FlowchartEditorState, useStore} from "../../store";
import shallow from "zustand/shallow";

export interface NodeRendererProps{

}
const NodeRenderer: React.FC<NodeRendererProps> = (props) => {
  const {} = props
  const nodes = useStore((state: FlowchartEditorState) => state.nodes, shallow)
  return(
    <div className={'flowchart-editor_nodes'}>
      {nodes.map(node => <Node key={node.id} node={node}/>)}
    </div>
  )
}

NodeRenderer.displayName = 'FlowchartNodeRenderer'
export default React.memo(NodeRenderer)