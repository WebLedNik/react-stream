import {Directions, Position} from "../../types";
import {Part} from "../Line";

export enum HandleTypeNames {
  Input = 'input',
  Output = 'output'
}

export interface HandleValues{
  id: string
  type: HandleTypeNames
  direction: Directions
}

export interface HandleActions{

}

export type HandleState = HandleValues & HandleActions