import { v4 as uuidv4 } from 'uuid';
import {NodeDTO, NodeState, NodeValues} from "./types";

const DEFAULT_WIDTH = 150
const DEFAULT_HEIGHT = 120
const DEFAULT_POSITION_X = 0
const DEFAULT_POSITION_Y = 0

export class Node implements NodeValues{
  id: string
  height: number;
  width: number;
  position: NodeState['position']
  drag: boolean

  constructor(payload: NodeDTO) {
    this.id = uuidv4()
    this.width = payload.width ?? DEFAULT_WIDTH
    this.height = payload.height ?? DEFAULT_HEIGHT
    this.position = payload.position ?? {x: DEFAULT_POSITION_X, y: DEFAULT_POSITION_Y}
    this.drag = true
  }
}