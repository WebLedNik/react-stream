import {Directions, Position} from "../../types";

export enum HandleTypeNames {
  Input = 'input',
  Output = 'output'
}

export interface HandleValues{
  id: string
  type: HandleTypeNames
  direction: Directions
  node: string
}

export interface HandleActions{

}

export type HandleState = HandleValues & HandleActions