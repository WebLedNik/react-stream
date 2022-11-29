import {Position} from "../../types";
import {LineState} from "../Line";
import {HandleState} from "../Handle";

export enum NodeStateNames {
  Fixed = 'fixed',
  Selected = 'selected'
}

export interface NodeDTO{
  width?: number
  height?: number
  position?: Position
  drag?: boolean
}

export interface NodeValues{
  id: string
  state: NodeStateNames
  width: number
  height: number
  position: Position
  drag: boolean
}

export interface NodeActions{

}

export type NodeState = NodeValues & NodeActions