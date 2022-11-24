import * as React from 'react'
import './style.css'
import {useEffect, useRef, useState} from "react";
import {select} from "d3-selection";
import {scaleLinear} from "d3-scale";
import {FlowchartEditorState, useStore} from "../../store";
import {DEFAULT_HEIGHT_MAP, DEFAULT_WIDTH_MAP, ViewBoxProps} from "./types";
import {minimapScaleX, minimapScaleY} from "./utils";

interface MapProps{}
const Map: React.FC<MapProps> = () => {
  const mapRef = useRef(null)
  const {nodes, zoomTransformState, width, height}: FlowchartEditorState = useStore((state) => state)

  const [viewBox, setViewBox] = useState<ViewBoxProps>({minX: 0, minY: 0, width: width, height: height})

  useEffect(() => {
    const selection = select(mapRef.current)

  }, [nodes])

  useEffect(() => {
    if (!width) return

    const selection = select(mapRef.current)
    const scale = DEFAULT_WIDTH_MAP/width

    selection
      .attr('width', minimapScaleX(scale, width)(width))
      .attr('height', minimapScaleY(scale, height)(height))
      .attr('viewBox', [0, 0, width, height].join(' '))
      .attr('preserveAspectRatio', 'xMidYMid meet');
  }, [width, height])

  useEffect(() => {
    const selection = select(mapRef.current)

    const scaleX = minimapScaleX(zoomTransformState.k, width).invert(-zoomTransformState.k + width);
    const scaleY = minimapScaleY(zoomTransformState.k, height).invert(-zoomTransformState.k + height);

    // const minXPos = Math.min(...nodes.map(n => n.position.x))
    // const maxXPos = Math.max(...nodes.map(n => n.position.x))
    // const minYPos = Math.min(...nodes.map(n => n.position.y))
    // const maxYPos = Math.max(...nodes.map(n => n.position.y))

    // const viewBoxWidth = viewBox.width + (viewBox.width - width)
    // const viewBoxHeight =  viewBox.height + (viewBox.height - height)
    //
    // const viewBoxMinX = 0
    // const viewBoxMinY = 0
    // console.log({scale, viewBoxMinX, viewBoxMinY, viewBoxWidth, viewBoxHeight})
    //setViewBox({minX: viewBoxMinX, minY: viewBoxMinY, width: viewBoxWidth, height: viewBoxHeight})
    // selection.attr('viewBox', `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`)
  }, [zoomTransformState, width, height])

  return(
    <svg ref={mapRef} className={'flowchart-editor_map'}>
      {nodes.map(node => <rect key={node.id} x={node.position.x} y={node.position.y} width={node.width} height={node.height} style={{borderRadius: '8px'}}/>)}

      <rect width="100%" height="100%" fill="blue" fillOpacity={.3}/>

    </svg>
  )
}

Map.displayName = 'FlowchartMap'
export default Map
export * from './types'