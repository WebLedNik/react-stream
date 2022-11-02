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
}

export interface GetLineDTOProps {
  position: Position
  handle: HandleState
}

export interface SetSourceProps {
  line?: LineState
  handle?: HandleState
}

export interface SetTargetProps {
  line?: LineState
  handle?: HandleState
  position?: Position
}

export interface SetTransformProps {
  position: Position
}

export interface SetPartProps{
  position: Position
}

export interface SetStatePartProps{
  part: Part
  state: PartStateNames
}

export interface LineActions {
  getMarkerType(): MarkerTypeNames
  getIsModified(): boolean
  getTargetPosition(): Position
  getStartPart(): Part | undefined
  getEndPart(): Part | undefined
  setState(state: LineStateNames): void
  setStatePart(props: SetStatePartProps): void
  setSource(props: SetSourceProps): void
  setTarget(props: SetTargetProps): void
  setTransform(props: SetTransformProps): void
  setPart(props: SetPartProps): void
  setTargetPosition(position: Position): void
  setSourcePosition(position: Position): void
}

export interface LineDTO {
  source: { handle?: HandleState, line?: LineState, position: Position }
  target: { handle?: HandleState, line?: LineState, position: Position }
  parts?: Part[]
  state?: LineStateNames
  selected?: boolean
}

export type LineState = LineValues & LineActions