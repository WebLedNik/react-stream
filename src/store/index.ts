import createContext from "zustand/context";
import {FlowchartEditorState, FlowchartEditorValues} from "./types";
import create from "zustand";
import {zoomIdentity, ZoomTransform} from "d3-zoom";
import {Node, NodeDTO, NodeState} from "../components/Node";
import {Line, LineDTO, LineState, LineValues} from "../components/Line";

// @ts-ignore
const {Provider, useStore, useStoreApi } = createContext<FlowchartEditorState>()

const initialState:FlowchartEditorValues = {
  width: 0,
  height: 0,
  nodes: [],
  lines: [],
  zoomTransformState: zoomIdentity
}

const createStore = () => create<FlowchartEditorState>((setState, getState) => ({
  ...initialState,
  setNodes: (nodes: NodeDTO[]) => {
    const payload = nodes.map(node => new Node(node))
    setState({nodes: [...payload, ...getState().nodes]})
  },
  updateNodes: (nodes: NodeState[]) => {
    const payload = getState().nodes.map(node => {
      const updatedNode = nodes.find(item => item.id === node.id)

      if (updatedNode){
        return {...node, ...updatedNode}
      }

      return node
    })

    setState({nodes: payload})
  },
  removeNodes(nodes: NodeState['id'][]) {
    const payload = getState().nodes.filter(node => !nodes.includes(node.id))

    setState({nodes: payload})
  },
  setLines: (lines: LineDTO[], cb?:(lines: LineState[]) => void) => {
    const payload = lines.map(line => new Line(line))
    setState({lines: [...payload, ...getState().lines]})
    return cb && cb(payload)
  },
  updateLines: (lines: LineState[]) => {
    const payload = getState().lines.map(line => {
      const updatedLine = lines.find(item => item.id === line.id)

      if (updatedLine) return updatedLine
      return line
    })

    setState({lines: payload})
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