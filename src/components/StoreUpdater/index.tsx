import * as React from 'react'
import {NodeState} from "../Node";
import {useEffect} from "react";
import {FlowchartEditorState, NodeTypes, useStore} from "../../store";
import {LineState} from "../Line";

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
  const {setNodes, setLinesWithoutDTO, setNodeTypes}:FlowchartEditorState = useStore((state) => state)


  useEffect(() => {
    if (!nodes) return
    setNodes(nodes)
  }, [nodes])

  useEffect(() => {
    if (!lines) return
    setLinesWithoutDTO(lines)
  }, [lines])

  useEffect(() => {
    if(!nodeTypes) return
    setNodeTypes(nodeTypes)
  }, [nodeTypes])

  return(
    <></>
  )
}

export default StoreUpdater