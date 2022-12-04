import {NodeCreator, NodeDTO, NodeState} from "../components";
import {useCallback, useState} from "react";

function useNodesState(init: NodeDTO[]): [NodeState[], (payload: NodeDTO[]) => void, (payload: NodeState[]) => void] {
  const [values, setValues] = useState<NodeState[]>(init.map(n => new NodeCreator(n)))
  const setNodes = (payload: NodeDTO[]) => setValues(payload.map(n => new NodeCreator(n)))
  const onChangeNodes = (updatedNodes: NodeState[]) => {
    setValues(prevState => prevState.map(node => {
      const updatedNode = updatedNodes.find(item => item.id === node.id)

      if (updatedNode){
        return {...node, ...updatedNode}
      }

      return node
    }))
  }

  return [
    values,
    setNodes,
    onChangeNodes
  ]
}

export default useNodesState
