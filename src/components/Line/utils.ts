import {v4 as uuidv4} from 'uuid';
import {LineDTO, LineValues, Part} from "./types";
import {Orientation, Position} from "../../types";

export class Line implements LineValues{
  id: string;
  source: LineValues['source']
  target: LineValues['target']
  parts: Part[];
  creating: boolean;
  updating: boolean;
  selected: boolean

  constructor(payload: LineDTO) {
    this.id = uuidv4()
    this.source = payload.source
    this.target = payload.target
    this.parts = payload.parts ?? []
    this.creating = payload.creating ?? false
    this.updating = payload.updating ?? false
    this.selected = payload.selected ?? false
  }
}

interface ValidateAcceptableIntervalProps{
  target: Position,
  root: Position,
  orientation: Orientation
  interval?: number
}
export function validateAcceptableInterval({target, root, orientation, interval = 20}: ValidateAcceptableIntervalProps){
  switch (orientation){
    case Orientation.Horizontal:
      return Math.abs(Math.abs(root.y) - (Math.abs(target.y))) <  interval
    default:
      return Math.abs(Math.abs(root.x) - (Math.abs(target.x))) <  interval
  }
}
