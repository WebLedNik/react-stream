import * as React from "react";
import ZoomPane from "../ZoomPane";
import NodeRenderer from "../NodeRenderer";
import Viewport from "../Viewport";
import LineRenderer from "../LineRenderer";
import {FlowchartEditorState, useStore} from "../../store";
import {NodeState} from "../Node";

export interface GraphViewProps {
  onNodesChange?:(nodes: NodeState[]) => void
  onNodeDragStop?:(nodes: NodeState[]) => void
  onDoubleClickZoomPane?:(event: MouseEvent) => void
}

const GraphView: React.FC<GraphViewProps> = (props) => {
  const {
    onNodeDragStop,
    onNodesChange,
    onDoubleClickZoomPane
  } = props
  return (
    <ZoomPane onDoubleClick={onDoubleClickZoomPane}>
      <Viewport>
        <NodeRenderer onNodesChange={onNodesChange} onNodeDragStop={onNodeDragStop}/>
        <LineRenderer />
      </Viewport>
    </ZoomPane>
  )
}

GraphView.displayName = 'FlowchartGraphView'
export default GraphView