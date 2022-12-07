import * as React from 'react'
import {NodeState} from "../Node";
import {useEffect} from "react";
import {FlowchartEditorState, NodeTypes, useStore} from "../../store";
import {LineState} from "../Line";
import KeyManagement from "../KeyManagement";

interface StoreUpdaterProps{
  nodes?: NodeState[]
  lines?: LineState[]
  nodeTypes?: NodeTypes
}

const StoreUpdater: React.FC<StoreUpdaterProps> = (props) => {
  const {
    nodes,
    lines,
    nodeTypes
  } = props
  const {setNodes, setNodeTypes, setLines}:FlowchartEditorState = useStore((state) => state)

  useEffect(() => {
    if (!nodes) return
    setNodes(nodes)
  }, [nodes])

  useEffect(() => {
    if (!lines) return
    setLines(lines)
  }, [lines])

  useEffect(() => {
    if(!nodeTypes) return
    setNodeTypes(nodeTypes)
  }, [nodeTypes])

  return(
    <></>
  )
}

StoreUpdater.displayName = 'FlowchartStoreUpdater'
export default StoreUpdater