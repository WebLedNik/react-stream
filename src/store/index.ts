import createContext from "zustand/context";
import {FlowchartEditorState, FlowchartEditorValues} from "./types";
import create from "zustand";
import {zoomIdentity, ZoomTransform} from "d3-zoom";
import {
  NodeCreator,
  NodeDTO,
  NodeState,
  LineCreator,
  LineDTO,
  LineState
} from "../components";
import {ComponentType} from "react";

// @ts-ignore
const {Provider, useStore, useStoreApi } = createContext<FlowchartEditorState>()

const initialState:FlowchartEditorValues = {
  width: 0,
  height: 0,
  nodeTypes: {},
  nodes: [],
  lines: [],
  zoomTransformState: zoomIdentity
}

const createStore = () => create<FlowchartEditorState>((setState, getState) => ({
  ...initialState,
  setNodeTypes: (payload: {[key: string]: ComponentType<any>}) => {
    setState({nodeTypes: payload})
  },
  setNodes: (nodes: NodeState[]) => {
    setState({nodes})
  },
  setLines: (lines: LineState[]) => {
    setState({lines})
  },
  removeNodes(nodes: NodeState['id'][]) {
    const payload = getState().nodes.filter(node => !nodes.includes(node.id))

    setState({nodes: payload})
  },
  removeLines(lines: LineState['id'][]) {
    const payload = getState().lines.filter(line => !lines.includes(line.id))

    setState({lines: payload})
  },
  setZoomTransformState(payload: ZoomTransform) {
    setState({zoomTransformState: payload})
  },
  setWidthHeightViewport(w: number, h: number) {
    setState({width: w, height: h})
  },
  reset: () => setState({ ...initialState })
}))

export {Provider, useStore, useStoreApi, createStore}
export * from './types'