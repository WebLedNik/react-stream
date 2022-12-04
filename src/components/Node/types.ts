import {Position} from "../../types";
import {LineState} from "../Line";
import {HandleState} from "../Handle";

export enum NodeStateNames {
  Fixed = 'fixed',
  Selected = 'selected'
}

export interface NodeDTO<T = any>{
  id?: string
  type?: string
  state?: NodeStateNames
  data?: T
  width?: number
  height?: number
  position?: Position
  drag?: boolean
}

export interface NodeValues<T = any>{
  id: string
  type: string
  state: NodeStateNames
  data: T
  width: number
  height: number
  position: Position
  drag: boolean
}

export interface NodeActions{}

export type NodeState = NodeValues & NodeActions