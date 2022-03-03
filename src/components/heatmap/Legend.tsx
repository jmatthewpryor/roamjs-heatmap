import React, { Fragment, useMemo } from 'react';
import { Rect, RectProps } from './Rect';
import { SVGProps } from './SVG';
import Tooltip from "@uiw/react-tooltip";
import { TooltipContent } from "./tooltip";

export interface LegendProps extends RectProps {
  prefixCls: SVGProps['prefixCls'];
  legend: SVGProps['legend'];
  rectSize: SVGProps['rectSize'];
  leftPad: number;
  legendCellSize: number;
  legendRender?: (props: RectProps) => React.ReactElement | void;
  topPad: number;
  space: number;
}
export default function Legend({
  prefixCls,
  legend,
  leftPad = 0,
  topPad = 0,
  space = 0,
  rectSize = 0,
  legendCellSize = 0,
  legendRender,
  ...props
}: LegendProps) {
  let size = legendCellSize || rectSize;
  return useMemo(
    () => (
      <Fragment>
        {legend.map((num, key) => {
          const rectProps = {
            ...props,
            key,
            x: (size + space) * key + leftPad,
            y: topPad + rectSize * 8 + (space * 4),
            className: `${prefixCls} legend-${key}`,
            width: size,
            height: size,
          };
          if (legendRender) return legendRender(rectProps);
          return (
            <Tooltip
            key={rectProps.key}
            placement="top"
            content={TooltipContent({
              date: "WOW",
              count: num || 0,
            })}
            delay={300}
          >
            <Rect {...rectProps} />
          </Tooltip>);
        })}
      </Fragment>
      
    ),
    [legend, props, size, leftPad, topPad, rectSize, legendRender],
  );
}
