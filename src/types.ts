export interface Position{
  x: number
  y: number
}

export enum Directions {
  Top= "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left"
};

export enum Orientation {
  Horizontal = "horizontal",
  Vertical = "vertical"
};

export interface SizeProps{
  width: number
  height: number
}