import React, { Fragment, useMemo } from 'react';
import { Rect, RectProps } from './Rect';
import { SVGProps } from './SVG';

export interface LegendProps extends RectProps {
  panelColors: SVGProps['panelColors'];
  rectSize: SVGProps['rectSize'];
  leftPad: number;
  legendCellSize: number;
  legendRender?: (props: RectProps) => React.ReactElement | void;
  topPad: number;
  space: number;
}
export default function Legend({
  panelColors,
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
        {Object.keys(panelColors || {}).map((num, key) => {
          const rectProps = {
            ...props,
            key,
            x: (size + 1) * key + leftPad,
            y: topPad + rectSize * 8 + 6,
            fill: panelColors![Number(num)],
            width: size,
            height: size,
          };
          if (legendRender) return legendRender(rectProps);
          return <Rect {...rectProps} />;
        })}
      </Fragment>
    ),
    [panelColors, props, size, leftPad, topPad, rectSize, legendRender],
  );
}
