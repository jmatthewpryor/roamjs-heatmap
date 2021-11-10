import * as ReactDOM from "react-dom";
import HeatMap, { HeatMapValue } from './components/heatmap';
import { getDateFromString } from "./components/heatmap/utils";
import * as React from "react";
import {getPageCalData} from './searchData';
import { differenceInWeeks } from 'date-fns'
import { toRoamDateUid, toRoamDate } from 'roam-client';
import Tooltip from '@uiw/react-tooltip';

const containerStyle = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'center',
  alignContent: 'center',
  listStyle: 'none',
};

const itemStyle = {
  padding: '1px',
  alignSelf: 'center',
};

const TooltipContent = ({
  date,
  count
}: {
  date: string;
  count: number;
}) : JSX.Element => {
    return (
      <div style={containerStyle}><div style={itemStyle}><strong>{toRoamDate(getDateFromString(date))}</strong></div><div style={itemStyle}>{count || 0}</div></div>
  )
};

const Heatmap = ({
  query,
  startDate,
  endDate,
  blockUid,
}: {
  query: string[];
  startDate: Date;
  endDate: Date;
  blockUid: string;
}) : JSX.Element => {
    const weekCount = differenceInWeeks(endDate, startDate) + 1;
    const rectSize=10;
    const space=2;
    const width=weekCount*(rectSize+space*2);

    return (
    <div>
      <HeatMap
        value={getPageCalData(query, startDate, endDate )}
        startDate={startDate}
        endDate={endDate}
        rectSize={rectSize}
        space={space}
        width={width}
        panelColors = {{ 0: '#EBEDF0', 4: '#C6E48B', 8: '#7BC96F', 12: '#239A3B', 32: '#196127' }}
        rectRender={(props, data) => /* if (!data.count) return <rect {...props} />;*/ (
          <Tooltip key={props.key} placement="top" content={TooltipContent({ date: data.date, count: data.count || 0 })} delay={300}>
            <rect {...props} onClick={() => {
              window.roamAlphaAPI.ui.mainWindow.openPage({ page: { uid: toRoamDateUid(getDateFromString(data.date)) } });
            } } />
          </Tooltip>
        )}
      />
    </div>
  )
};

export const renderHeatmap = (
  query: string[],
  startDate: Date,
  endDate: Date,
    blockUid: string,
    p: HTMLElement
  ): void => {
      ReactDOM.render(<Heatmap startDate={startDate} blockUid={blockUid} endDate={endDate} query={query}/>, p);
  }
  
export default Heatmap;
