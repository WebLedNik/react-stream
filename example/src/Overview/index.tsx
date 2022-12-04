import * as React from "react";

import {FlowchartEditor, NodeTypes, useNodesState} from "../../../src";
import {useMemo} from "react";


interface OverviewProps {
}

const Overview: React.FC<OverviewProps> = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])

  const nodeTypes: NodeTypes = useMemo(() => ({
    'test': <div>Test</div>
  }), [])

  const handleAddNode = (event: React.MouseEvent) => {
    setNodes([...nodes, {id: String(nodes.length), type:'test'}])
  }

  return (
    <>
      <div>
        <button onClick={handleAddNode}>Add node</button>
      </div>
      <FlowchartEditor
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodesChange}
      />
    </>
  )
}

export default Overview