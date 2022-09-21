import {Directions, Position} from "../../types";

interface Path{
  direction: Directions,
  moveTo: Position,
  lineTo: Position
}

export interface LineDTO{
  source: { id?: string, position: Position }
  target: { id?: string, position: Position }
  paths?: Path[]
  transforming?: boolean
  selected?:boolean
}

export interface LineValues{
  id: string
  source: { id?: string, position: Position }
  target: { id?: string, position: Position }
  paths: Path[]
  transforming: boolean
  selected: boolean
}

export interface LineActions{

}

export type LineState = LineValues & LineActions