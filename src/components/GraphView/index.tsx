import * as React from "react";
import ZoomPane from "../ZoomPane";
import NodeRenderer from "../NodeRenderer";
import Viewport from "../Viewport";
import LineRenderer from "../LineRenderer";

export interface GraphViewProps {
}

const GraphView: React.FC<GraphViewProps> = (props) => {
  return (
    <ZoomPane>
      <Viewport>
        <NodeRenderer/>
        <LineRenderer/>
      </Viewport>
    </ZoomPane>
  )
}

GraphView.displayName = 'GraphView'
export default GraphView