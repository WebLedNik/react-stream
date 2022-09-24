import {Directions, Orientation, Position} from "../../types";

export interface Part{
  id: string
  start: Position
  end: Position
  orientation: Orientation
}

export interface LineDTO{
  source: { id?: string, position: Position }
  target: { id?: string, position: Position }
  parts?: Part[]
  creating?: boolean
  updating?: boolean
  selected?:boolean
}

export interface LineValues{
  id: string
  source: { id?: string, position: Position }
  target: { id?: string, position: Position }
  parts: Part[]
  creating: boolean
  updating: boolean
  selected: boolean
}

export interface LineActions{

}

export type LineState = LineValues & LineActions