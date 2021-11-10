import * as React from 'react';
import SVG, { SVGProps } from './SVG';
import { addStyle } from "roam-client";


addStyle(`
  svg.w-heatmap {
    color: #24292e;
    -webkit-user-select: none;
            user-select: none;
    display: block;
    font-size: 10px;
  }
  svg.w-heatmap rect {
    display: block;
    cursor: pointer;
  }
  svg.w-heatmap rect:hover {
    stroke: rgba(0, 0, 0, 0.14);
    stroke-width: 1px;
  }
  svg.w-heatmap rect:active {
    fill: #196127;
    stroke-width: 0;
  }
  svg.w-heatmap text {
    text-anchor: middle;
    font-size: inherit;
    fill: currentColor;
  }
`);

export * from './SVG';

export interface HeatMapProps extends SVGProps {
  prefixCls?: string;
}

export default function HeatMap(props: HeatMapProps) {
  const { prefixCls = 'w-heatmap', className, ...others } = props;
  const cls = [className, prefixCls].filter(Boolean).join(' ');
  return <SVG className={cls} {...others} />;
}
