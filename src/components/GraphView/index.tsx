import * as React from "react";
import ZoomPane from "../ZoomPane";
import NodeRenderer from "../NodeRenderer";
import Viewport from "../Viewport";
import LineRenderer from "../LineRenderer";
import {FlowchartEditorState, useStore} from "../../store";

export interface GraphViewProps {
  onDoubleClickZoomPane?:(event: MouseEvent) => void
}

const GraphView: React.FC<GraphViewProps> = (props) => {
  const {onDoubleClickZoomPane} = props
  return (
    <ZoomPane onDoubleClick={onDoubleClickZoomPane}>
      <Viewport>
        <NodeRenderer />
        <LineRenderer />
      </Viewport>
    </ZoomPane>
  )
}

GraphView.displayName = 'FlowchartGraphView'
export default GraphView