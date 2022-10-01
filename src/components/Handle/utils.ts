import {Directions, Orientation} from "../../types";

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