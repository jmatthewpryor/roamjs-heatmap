import * as React from 'react';
import SVG, { SVGProps } from './SVG';
import { addStyle } from "roam-client";

export interface HeatMapSettings {
  query?: {
    refs?: string[]
  };
  display?: {
    rectSize?: number;
    space?: number;
    legendCellSize?: number;
    prefixCls?: string;
    legend?: number[];
  };
  range?: {
    days?: number;
    startDate?: Date;
    endDate?: Date;
  }
}

addStyle(`
  svg.roamjs-heatmap {
    color: #24292e;
    -webkit-user-select: none;
            user-select: none;
    display: block;
    font-size: 10px;
  }
  svg.roamjs-heatmap rect {
    display: block;
    cursor: pointer;
  }
  svg.roamjs-heatmap rect:hover {
    stroke: rgba(0, 0, 0, 0.14);
    stroke-width: 1px;
  }
  svg.roamjs-heatmap rect:active {
    fill: #196127;
    stroke-width: 0;
  }
  svg.roamjs-heatmap text {
    text-anchor: middle;
    font-size: inherit;
    fill: currentColor;
  }
  .roamjs-heatmap .legend-0 {
    fill: #EBEDF0;
  }
  .roamjs-heatmap .legend-4 {
    fill: #C6E48B;
  }
  .roamjs-heatmap .legend-8  {
    fill: #7BC96F;
  }
  .roamjs-heatmap .legend-12 {
    fill: #239A3B;
  }
  .roamjs-heatmap .legend-32 {
    fill: #196127;
  }

`);

export * from './SVG';

export interface HeatMapProps extends SVGProps {
}

export default function HeatMap(props: HeatMapProps) {
  const { prefixCls = 'roamjs-heatmap', className, ...others } = props;
  const cls = [className, prefixCls].filter(Boolean).join(' ');
  return <SVG className={cls} prefixCls={prefixCls} {...others} />;
}
