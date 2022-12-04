import {ZoomTransform} from "d3-zoom";
import {NodeDTO, NodeState} from "../components/Node";
import {LineDTO, LineState, LineValues} from "../components/Line";
import {ComponentType} from "react";

export type NodeTypes = {[key: string]: ComponentType<any> | Element | JSX.Element}

export interface FlowchartEditorValues{
  width: number
  height: number
  nodeTypes: NodeTypes
  nodes: NodeState[]
  lines: LineState[]
  zoomTransformState: ZoomTransform
}

export interface FlowchartEditorActions {
  setNodeTypes(payload: {[key: string]: ComponentType<any>}): void
  setNodes(nodes: NodeState[]): void
  removeNodes(nodes: NodeState['id'][]): void
  setLinesWithoutDTO(lines: LineState[]): void
  setLines(lines: LineDTO[]): void
  updateLines(lines: LineState[]): void
  removeLines(lines: LineState['id'][]): void
  setZoomTransformState(payload: ZoomTransform): void
  setWidthHeightViewport(w: number, h: number): void
  reset(): void
}

export type  FlowchartEditorState = FlowchartEditorValues & FlowchartEditorActions
