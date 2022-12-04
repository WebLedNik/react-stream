import * as React from "react";
import {useMemo} from "react";
import {
  Background,
  Controls,
  FlowchartEditor,
  LineState,
  NodeState,
  NodeTypes,
  useLinesState,
  useNodesState
} from "../../../src";
import {NodeTypeNames, ProcessNode, StartNode} from "./Nodes";

interface OverviewProps {
}

const Overview: React.FC<OverviewProps> = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [lines, setLines, onLinesChange] = useLinesState([])

  const nodeTypes: NodeTypes = useMemo(() => ({
    [NodeTypeNames.Start]: StartNode,
    [NodeTypeNames.Process]: ProcessNode,
  }), [])

  const handleAddNodeTypeStart = (event: React.MouseEvent) => {
    setNodes([...nodes, {id: String(nodes.length), type: NodeTypeNames.Start, width: 50, height: 50}])
  }
  const handleAddNodeTypeProcess= (event: React.MouseEvent) => {
    setNodes([...nodes, {id: String(nodes.length), type: NodeTypeNames.Process, width: 200, height: 150}])
  }
  const handleViewLogs = () => {
    console.log('Logs',{nodes, lines})
  }
  const handleConnect = (line: LineState) => {
    onLinesChange([line])
  }
  const handleNodesDelete = (values: NodeState[]) => {
    setNodes(nodes.filter(n => !values.map(el => el.id).includes(n.id)))
  }
  const handleLinesDelete = (values: LineState[]) => {
    console.log({values})
    setLines(lines.filter(l => !values.map(el => el.id).includes(l.id)))
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div>
        <button onClick={handleAddNodeTypeStart}>Add node "Start"</button>
        <button onClick={handleAddNodeTypeProcess}>Add node "Process"</button>
        <button onClick={handleViewLogs}>View logs</button>
      </div>
      <FlowchartEditor
        nodes={nodes}
        lines={lines}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodesChange}
        onLinesChange={onLinesChange}
        onConnect={handleConnect}
        onNodesDelete={handleNodesDelete}
        onLinesDelete={handleLinesDelete}
      >
        <Controls/>
        <Background/>
      </FlowchartEditor>
    </div>
  )
}

export default Overview