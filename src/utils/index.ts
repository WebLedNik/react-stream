import {Directions, Orientation, Position} from "../types";

export function getTransformTranslateScaleStyle(position: Position & {k: number}){
  return `transform: translate(${position.x}px, ${position.y}px) scale(${position.k})`
}

export function getTransformTranslateStyle(position: Position){
  return `transform: translate(${position.x}px, ${position.y}px)`
}

interface GetRelativePositionProps{parent: HTMLDivElement, child: HTMLDivElement}
export function getRelativePosition({parent, child}:GetRelativePositionProps):Position {
  const parentPos = parent.getBoundingClientRect()
  const childPos = child.getBoundingClientRect()

  const x =  childPos.left - parentPos.left;
  const y =  childPos.top - parentPos.top;

  return {x,y}
}

const RAD_TO_DEG = 180 / Math.PI;
const point = ( x = 0, y = 0 ) => ({ x, y });
const length = ( { x, y }: Position ) => Math.sqrt( x * x + y * y );
const normalize = ( vector: Position ) => {
  let vectorLength = length( vector );
  let { x, y } = vector;

  return point( x / vectorLength, y / vectorLength );
};
const subtract = ( a: {x: number, y: number}, b: {x: number, y: number} ) => ({ x: a.x - b.x, y: a.y - b.y });

function getCenterPositionElement(element: Element){
  const rectangle = element.getBoundingClientRect();
  return point(
    rectangle.width / 2 + rectangle.left,
    rectangle.height / 2 + rectangle.top
  );
}

interface GetDirectionCursorProps{
  clientX: number,
  clientY: number,
  rootX?: number,
  rootY?: number,
  rootElement?: Element,
}
export function getDirectionCursor(props: GetDirectionCursorProps){
  const {rootElement,clientX,clientY, rootX, rootY} = props
  if (!rootX && !rootY && !rootElement) return

  const center = rootElement ? getCenterPositionElement(rootElement): point(rootX, rootY)
  const mouse = point( clientX, clientY );
  const mc = subtract( mouse, center );
  const direction = normalize( mc );
  const angle = Math.atan2( direction.y, direction.x ) * RAD_TO_DEG;

  if( angle <= -45 && angle > -130 ) return Directions.Top;
  if( angle > -180 && angle <= -130 || angle <= 180 && angle > 130 ) return Directions.Left;
  if( angle > 45 && angle <= 130 ) return Directions.Bottom;

  return Directions.Right;
}

export function getOrientation(direction: Directions): Orientation{
  switch (direction){
    case Directions.Right:
      return Orientation.Horizontal
    case Directions.Left:
      return Orientation.Horizontal
    case Directions.Top:
      return Orientation.Vertical
    case Directions.Bottom:
      return Orientation.Vertical
  }
}