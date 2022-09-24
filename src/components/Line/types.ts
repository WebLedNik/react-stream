import {Directions, Position} from "../../types";

export interface PathValues{
  id: string
  direction: Directions
  moveTo: Position
  lineTo: Position
}

export interface PathDTO{
  direction: Directions
  moveTo: Position
  lineTo: Position
  source?: string
  target?: string
  paths?: Array<PathValues['id']>
}

export interface LineDTO{
  source: { id?: string, position: Position }
  target: { id?: string, position: Position }
  paths?: PathValues[]
  transforming?: boolean
  selected?:boolean
}

export interface LineValues{
  id: string
  source: { id?: string, position: Position }
  target: { id?: string, position: Position }
  paths: PathValues[]
  transforming: boolean
  selected: boolean
}

export interface LineActions{

}

export type LineState = LineValues & LineActions