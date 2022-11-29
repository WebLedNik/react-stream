import {ZoomTransform} from "d3-zoom";
import {NodeDTO, NodeState} from "../components/Node";
import {LineDTO, LineState, LineValues} from "../components/Line";

export interface FlowchartEditorValues{
  width: number
  height: number
  nodes: NodeState[]
  lines: LineState[]
  zoomTransformState: ZoomTransform
}

export interface FlowchartEditorActions {
  setNodes(nodes: NodeDTO[]): void
  updateNodes(nodes: NodeState[]): void
  removeNodes(nodes: NodeState['id'][]): void
  setLines(lines: LineDTO[]): void
  updateLines(lines: LineState[]): void
  removeLines(lines: LineState['id'][]): void
  setZoomTransformState(payload: ZoomTransform): void
  setWidthHeightViewport(w: number, h: number): void
  reset(): void
}

export type  FlowchartEditorState = FlowchartEditorValues & FlowchartEditorActions
