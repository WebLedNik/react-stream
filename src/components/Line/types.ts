import {Directions, Orientation, Position} from "../../types";
import {HandleState} from "../Handle/types";

export interface Part{
  id: string
  start: Position
  end: Position
  orientation: Orientation
}

export interface LineDTO{
  source: { handle: HandleState, position: Position }
  target: { handle?: HandleState, position?: Position }
  parts?: Part[]
  creating?: boolean
  updating?: boolean
  selected?:boolean
}

export interface LineValues{
  id: string
  source: { handle: HandleState, position: Position }
  target: { handle?: HandleState, position?: Position }
  parts: Part[]
  creating: boolean
  updating: boolean
  selected: boolean
}

export interface LineActions{

}

export type LineState = LineValues & LineActions