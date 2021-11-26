import React, { Fragment, useMemo } from 'react';
import { Rect, RectProps } from './Rect';
import { SVGProps } from './SVG';

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
            className: `${prefixCls} legend-${num}`,
            width: size,
            height: size,
          };
          if (legendRender) return legendRender(rectProps);
          return <Rect {...rectProps} />;
        })}
      </Fragment>
    ),
    [legend, props, size, leftPad, topPad, rectSize, legendRender],
  );
}
