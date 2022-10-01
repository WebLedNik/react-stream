export enum MarkerTypeNames{
  Arrow = 'handle-line-target-arrow',
  Circle = 'handle-line-target-circle',
  Hidden = ''
}

export interface MarkerProps{
  type: MarkerTypeNames
}