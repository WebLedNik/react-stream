import * as React from "react";
import ZoomPane from "../ZoomPane";
import NodeRenderer from "../NodeRenderer";
import Viewport from "../Viewport";
import LineRenderer from "../LineRenderer";
import {FlowchartEditorState, useStore} from "../../store";
import {NodeState} from "../Node";
import {LineState} from "../Line";

export interface GraphViewProps {
  onLinesChange?: (lines: LineState[], isCreate?: boolean) => void
  onNodesChange?:(nodes: NodeState[]) => void
  onNodeDragStop?:(nodes: NodeState[]) => void
  onDoubleClickZoomPane?:(event: MouseEvent) => void
}

const GraphView: React.FC<GraphViewProps> = (props) => {
  const {
    onNodeDragStop,
    onNodesChange,
    onDoubleClickZoomPane,
    onLinesChange
  } = props
  return (
    <ZoomPane onDoubleClick={onDoubleClickZoomPane}>
      <Viewport>
        <NodeRenderer onNodesChange={onNodesChange} onNodeDragStop={onNodeDragStop} onLinesChange={onLinesChange}/>
        <LineRenderer onLinesChange={onLinesChange}/>
      </Viewport>
    </ZoomPane>
  )
}

GraphView.displayName = 'FlowchartGraphView'
export default GraphView