import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { LabelsWeek } from './LabelsWeek';
import { LabelsMonth } from './LabelsMonth';
import { Rect } from './Rect';
import { formatData, getDateToString, findLegendBand, numberSort } from './utils';
import Legend, { LegendProps } from './Legend';
import { compareAsc, startOfDay, addDays, startOfWeek } from 'date-fns';

export type HeatMapValue = {
  date: string;
  content: string | string[] | React.ReactNode;
  count: number;
};


export type RectProps<T = SVGRectElement> = React.SVGProps<T>;

export interface SVGProps extends React.SVGProps<SVGSVGElement> {
  prefixCls?: string;
  startDate?: Date;
  endDate?: Date;
  rectSize?: number;
  legendCellSize?: number;
  space?: number;
  rectProps?: RectProps;
  legendRender?: LegendProps['legendRender'];
  rectRender?: <E = SVGRectElement>(
    data: E & { key: number },
    valueItem: HeatMapValue & {
      column: number;
      row: number;
      index: number;
    },
  ) => React.ReactElement | void;
  value?: Array<HeatMapValue>;
  weekLabels?: string[] | false;
  monthLabels?: string[] | false;
  legend?: number[];
}

export const LEFT_PAD = 28;
export const TOP_PAD = 20;

export default function SVG(props: SVGProps) {
  const {
    prefixCls = 'roamjs-heatmap',
    rectSize = 11,
    legendCellSize = 11,
    space = 2,
    startDate = new Date(),
    endDate,
    rectProps,
    rectRender,
    legendRender,
    value = [],
    weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    legend = [0, 4, 8, 12, 32],
    ...other
  } = props || {};
  const [gridNum, setGridNum] = useState(0);
  const [leftPad, setLeftPad] = useState(!!weekLabels ? LEFT_PAD : 5);
  const [topPad, setTopPad] = useState(!!monthLabels ? TOP_PAD : 5);
  const svgRef = React.createRef<SVGSVGElement>();
  const nums = useMemo(() => numberSort(legend), [legend]);
  const data = useMemo(() => formatData(value), [value]);
  useEffect(() => {
    setLeftPad(!!weekLabels ? 28 : 5)
  }, [weekLabels]);
  useEffect(() => {
    if (svgRef.current) {
      const width = svgRef.current.clientWidth - leftPad || 0;
      setGridNum(Math.floor(width / (rectSize + space)) || 0);
    }
  }, [rectSize, svgRef, space, leftPad]);

  useEffect(() => {
    setTopPad(!!monthLabels ? 20 : 5);
  }, [monthLabels]);

  const initStartDate = useMemo(() => {
      // need the grid to start on the first day of the week (i.e. Sunday)
      return startOfDay(startOfWeek(startDate));
  }, [startDate]);

  return (
    <svg ref={svgRef} {...other}>
      {legendCellSize !== 0 && (
        <Legend
          legendRender={legendRender}
          prefixCls={prefixCls}
          legend={legend}
          rectSize={rectSize}
          legendCellSize={legendCellSize}
          leftPad={leftPad}
          topPad={topPad}
          space={space}
        />
      )}
      <LabelsWeek weekLabels={weekLabels} rectSize={rectSize} space={space} topPad={topPad} />
      <LabelsMonth
        monthLabels={monthLabels}
        rectSize={rectSize}
        space={space}
        leftPad={leftPad}
        colNum={gridNum}
        startDate={initStartDate}
      />
      <g transform={`translate(${leftPad}, ${topPad})`}>
        {gridNum > 0 &&
          [...Array(gridNum)].map((_, idx) => {
            return (
              <g key={idx} data-column={idx}>
                {[...Array(7)].map((_, cidx) => {
                  const dayProps: RectProps = {
                    ...rectProps,
                    key: cidx,
                    fill: '#EBEDF0',
                    width: rectSize,
                    height: rectSize,
                    x: idx * (rectSize + space),
                    y: (rectSize + space) * cidx,
                  };
                  const currentDate = addDays(initStartDate, (idx * 7 + cidx));
                  const date = getDateToString(currentDate);
                  const dataProps = {
                    ...data[date],
                    date: date,
                    row: cidx,
                    column: idx,
                    index: idx * 7 + cidx,
                  };

                  if (endDate instanceof Date && compareAsc(currentDate, endDate) > 0 ) {
                    return null;
                  }
                  if (date && data[date] && legend && legend.length > 0) {
                    let band = findLegendBand(data[date].count || 0, nums);
                    dayProps.className = `${prefixCls} legend-${band}`;

                  } else if (legend && legend[0]) {
                    dayProps.className = `${prefixCls} legend-${legend[0]}`;
                  }
                  if (rectRender && typeof rectRender === 'function') {
                    const elm = rectRender({ ...dayProps, key: cidx }, dataProps);
                    if (elm && React.isValidElement(elm)) {
                      return elm;
                    }
                  }
                  return (
                    <Rect
                      {...dayProps}
                      data-date={date}
                      data-index={dataProps.index}
                      data-row={dataProps.row}
                      data-column={dataProps.column}
                    />
                  );
                })}
              </g>
            );
          })}
      </g>
    </svg>
  );
}
