import {v4 as uuidv4} from 'uuid';
import {LineDTO, LineValues, PathDTO, PathValues} from "./types";
import {Directions, Position} from "../../types";

export class Path implements PathValues{
  id: string
  direction: Directions;
  lineTo: Position;
  moveTo: Position;

  constructor(payload: PathDTO) {
    this.id = uuidv4()
    this.direction = payload.direction
    this.lineTo = payload.lineTo
    this.moveTo = payload.moveTo
  }
}

export class Line implements LineValues{
  id: string;
  source: LineValues['source']
  target: LineValues['target']
  paths: LineValues['paths']
  transforming: boolean
  selected: boolean

  constructor(payload: LineDTO) {
    this.id = uuidv4()
    this.source = payload.source
    this.target = payload.target
    this.paths = payload.paths ?? []
    this.transforming = payload.transforming ?? false
    this.selected = payload.selected ?? false
  }
}
