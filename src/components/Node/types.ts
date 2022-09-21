import {Position} from "../../types";

export interface NodeDTO{
  width?: number
  height?: number
  position?: Position
}

export interface NodeValues{
  id: string
  width: number
  height: number
  position: Position
  drag: boolean
}

export interface NodeActions{

}

export type NodeState = NodeValues & NodeActions