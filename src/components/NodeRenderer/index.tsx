import * as React from 'react'
import './style.css'
import Node, {NodeState} from "../Node";
import {FlowchartEditorState, useStore} from "../../store";
import {isEqualArray} from "../../utils";
import {LineRendererProps} from "../LineRenderer";

export interface NodeRendererProps{
  nodes: NodeState[]
}
const NodeRenderer: React.FC<NodeRendererProps> = (props) => {
  const {nodes} = props
  const {}:FlowchartEditorState = useStore((state) => state)
  console.log('NodeRenderer')
  return(
    <div className={'flowchart-editor_nodes'}>
      {nodes.map(node => <Node key={node.id} node={node}/>)}
    </div>
  )
}

NodeRenderer.displayName = 'FlowchartNodeRenderer'
const areEqual = (prevProps: NodeRendererProps, nextProps: NodeRendererProps) => isEqualArray(prevProps.nodes, nextProps.nodes)
export default React.memo(NodeRenderer, areEqual)