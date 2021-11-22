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

export * from './SVG';

export interface HeatMapProps extends SVGProps {
}

export default function HeatMap(props: HeatMapProps) {
  const { prefixCls = 'roamjs-heatmap', className, ...others } = props;
  const cls = [className, prefixCls].filter(Boolean).join(' ');
  return <SVG className={cls} prefixCls={prefixCls} {...others} />;
}
