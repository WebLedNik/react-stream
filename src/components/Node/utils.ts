import {v4 as uuidv4} from 'uuid';
import {NodeDTO, NodeState, NodeStateNames, NodeValues} from "./types";
import {Position} from "../../types";

const DEFAULT_WIDTH = 250
const DEFAULT_HEIGHT = 150
const DEFAULT_POSITION_X = 0
const DEFAULT_POSITION_Y = 0

export class Node implements NodeValues{
  id: string
  state: NodeStateNames
  height: number;
  width: number;
  position: NodeState['position']
  drag: boolean
  lines: NodeState['lines']

  constructor(payload: NodeDTO) {
    this.id = uuidv4()
    this.state = NodeStateNames.Fixed
    this.width = payload.width ?? DEFAULT_WIDTH
    this.height = payload.height ?? DEFAULT_HEIGHT
    this.position = payload.position ?? {x: DEFAULT_POSITION_X, y: DEFAULT_POSITION_Y}
    this.drag = true
    this.lines = payload.lines ?? []
  }
}

export function getRectangleVerticesCoordinate(node: NodeState): {left_top: Position, left_bottom: Position, right_top: Position, right_bottom: Position}{
  return {
    left_top: node.position,
    left_bottom: {x: node.position.x, y: node.position.y + node.height},
    right_top: {x: node.position.x + node.width, y: node.position.y},
    right_bottom: {x: node.position.x + node.width, y: node.position.y + node.height},
  }
}