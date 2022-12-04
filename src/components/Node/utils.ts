import {v4 as uuidv4} from 'uuid';
import {NodeDTO, NodeState, NodeStateNames, NodeValues} from "./types";
import {Position} from "../../types";
import {getRootElement} from "../../utils";
import {HandleValues} from "../Handle";

const DEFAULT_WIDTH = 250
const DEFAULT_HEIGHT = 150
const DEFAULT_POSITION_X = 0
const DEFAULT_POSITION_Y = 0

export class NodeCreator implements NodeValues {
  id: string
  type: string
  state: NodeStateNames
  height: number;
  width: number;
  position: NodeState['position']
  drag: boolean

  constructor(payload: NodeDTO) {
    this.id = payload.id ?? uuidv4()
    this.type = payload.type ?? 'default'
    this.state = payload.state ?? NodeStateNames.Fixed
    this.width = payload.width ?? DEFAULT_WIDTH
    this.height = payload.height ?? DEFAULT_HEIGHT
    this.position = payload.position ?? {x: DEFAULT_POSITION_X, y: DEFAULT_POSITION_Y}
    this.drag = payload.drag ?? true
  }
}

export function getNodeElement(id: string): HTMLDivElement | undefined | null {
  const rootElement = getRootElement()
  if (!rootElement) return

  return rootElement.querySelector(`[data-id='${id}']`) as HTMLDivElement
}

export function getRectangleVerticesCoordinate(node: NodeState): { left_top: Position, left_bottom: Position, right_top: Position, right_bottom: Position } {
  return {
    left_top: node.position,
    left_bottom: {x: node.position.x, y: node.position.y + node.height},
    right_top: {x: node.position.x + node.width, y: node.position.y},
    right_bottom: {x: node.position.x + node.width, y: node.position.y + node.height},
  }
}

export function getNodePropsFromDataset(id: string): Pick<NodeValues, 'position'> | undefined {
  const rootElement = getRootElement()
  if (!rootElement) return

  const node = rootElement.querySelector(`[data-id='${id}']`) as HTMLDivElement
  if (!node) return

  const x = node.dataset.x
  const y = node.dataset.y


  if (!x || !y) return

  const position = {x: Number(x), y: Number(y)}
  return {position}
}