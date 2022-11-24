import {Directions, Orientation, Position} from "../../types";
import {HandleState} from "../Handle";
import {MarkerTypeNames} from "../LineRenderer";

export const MAX_DRAWN_PARTS = 2

export enum LineStateNames {
  Created = 'created',
  Updated = 'updated',
  UpdatedByNode = 'updated_by_node',
  Fixed = 'fixed',
  Selected = 'selected'
}

export enum PartStateNames {
  Updated = 'updated',
  Fixed = 'fixed',
}

export interface Part {
  id: string
  lineId: string
  start: Position
  state: PartStateNames
  end: Position
  orientation: Orientation
}

export interface LineValues {
  id: string
  source: { handle?: HandleState, line?: LineState, position: Position }
  target: { handle?: HandleState, line?: LineState, position?: Position }
  parts: Part[]
  state: LineStateNames
  drawnParts: number
}

export interface GetLineDTOProps {
  position: Position
  handle: HandleState
}

export interface SetLineSourceProps {
  currentLine: LineState
  line?: LineState
  handle?: HandleState
}

export interface SetLineTargetPositionProps{
  currentLine: LineState
  position: Position
}

export interface SetLineSourcePositionProps{
  currentLine: LineState
  position: Position
}

export interface SetLineTargetProps {
  currentLine: LineState
  line?: LineState
  handle?: HandleState
  position?: Position
}

export interface SetLineTransformProps {
  line: LineState
  position: Position
}

export interface SetLineStateProps{
  line: LineState,
  state: LineStateNames
}

export interface SetLinePartProps{
  currentLine: LineState
  position: Position
}

export interface SetLineStatePartProps{
  parts: Part[]
  part: Part
  state: PartStateNames
}

export interface LineActions {}

export interface LineDTO {
  source: { handle?: HandleState, line?: LineState, position: Position }
  target: { handle?: HandleState, line?: LineState, position: Position }
  parts?: Part[]
  state?: LineStateNames
  drawnParts?: number
}

export type LineState = LineValues & LineActions