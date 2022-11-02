import {Directions, Orientation} from "../../types";
import {getRootElement} from "../../utils";
import {HandleValues} from "./types";

interface GetOrientationFromHandleDirectionProps{
  direction: Directions | string
}
export function getOrientationFromDirection(props: GetOrientationFromHandleDirectionProps): Orientation{
  const {direction} = props
  switch (direction){
    case Directions.Top:
      return Orientation.Vertical
    case Directions.Right:
      return Orientation.Horizontal
    case Directions.Left:
      return Orientation.Horizontal
    default:
      return Orientation.Vertical
  }
}

export function getHandleElement(id: string): HTMLDivElement | undefined | null{
  const rootElement = getRootElement()
  if (!rootElement) return

  return rootElement.querySelector(`[data-id='${id}']`) as HTMLDivElement
}

export function getHandleProps(id: string): HandleValues | undefined{
  const rootElement = getRootElement()
  if (!rootElement) return

  const handle = rootElement.querySelector(`[data-id='${id}']`) as HTMLDivElement
  if (!handle) return

  const type = handle.dataset.handleType
  const direction = handle.dataset.direction

  if (!type || !direction) return

  // @ts-ignore
  return {id, type, direction}
}