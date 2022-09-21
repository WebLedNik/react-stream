import {scaleLinear} from "d3-scale";

export function minimapScaleX(scale: number, width: number){
  return scaleLinear([0, width], [0, width * scale])
}
export function minimapScaleY(scale: number, height: number){
  return scaleLinear([0, height], [0, height * scale])
}