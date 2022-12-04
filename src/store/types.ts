import {ZoomTransform} from "d3-zoom";
import {NodeDTO, NodeState} from "../components/Node";
import {LineDTO, LineState, LineValues} from "../components/Line";
import {ComponentType} from "react";

export type NodeTypes = {[key: string]: ComponentType<any>}

export interface FlowchartEditorValues{
  width: number
  height: number
  nodeTypes: NodeTypes
  nodes: NodeState[]
  lines: LineState[]
  zoomTransformState: ZoomTransform
}

export interface FlowchartEditorActions {
  setNodeTypes(payload: NodeTypes): void
  setNodes(nodes: NodeState[]): void
  removeNodes(nodes: NodeState['id'][]): void
  setLines(lines: LineState[]): void
  removeLines(lines: LineState['id'][]): void
  setZoomTransformState(payload: ZoomTransform): void
  setWidthHeightViewport(w: number, h: number): void
  reset(): void
}

export type  FlowchartEditorState = FlowchartEditorValues & FlowchartEditorActions
