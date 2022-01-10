import * as ReactDOM from "react-dom";
import HeatMap, { HeatMapSettings, HeatMapValue, LEFT_PAD, TOP_PAD } from "./components/heatmap";
import { getDateFromString } from "./components/heatmap/utils";
import * as React from "react";
import { getPageCalData } from "./searchData";
import { differenceInWeeks } from "date-fns";
import { toRoamDateUid, toRoamDate } from "roam-client";
import Tooltip from "@uiw/react-tooltip";
import { useState } from "react";

const containerStyle = {
  display: "flex",
  flexFlow: "column wrap",
  justifyContent: "center",
  alignContent: "center",
  listStyle: "none",
};

const itemStyle = {
  padding: "1px",
  alignSelf: "center",
};

const TooltipContent = ({
  date,
  count,
}: {
  date: string;
  count: number;
}): JSX.Element => {
  return (
    <div style={containerStyle}>
      <div style={itemStyle}>
        <strong>{toRoamDate(getDateFromString(date))}</strong>
      </div>
      <div style={itemStyle}>{count || 0}</div>
    </div>
  );
};

const Heatmap = ({
  settings,
  blockUid,
}: {
  settings: HeatMapSettings;
  blockUid: string;
}): JSX.Element => {
  const weekCount = Math.max(settings.display.legend.length, differenceInWeeks(settings.range.endDate, settings.range.startDate, {roundingMethod: "ceil"}) + 1);
  const width = (weekCount * (settings.display.rectSize + settings.display.space )) + LEFT_PAD;
  const height = (7 * (settings.display.rectSize + settings.display.space)) + (settings.display.rectSize + (settings.display.space * 4)) + TOP_PAD;

  if (settings.debug) {
    console.log("HEATMAP>", settings);
    console.dir(settings);
  }
  return (
    <div>
      <HeatMap
        prefixCls={settings.display.prefixCls}
        value={getPageCalData(settings.query.refs, settings.range.startDate, settings.range.endDate, settings.debug)}
        startDate={settings.range.startDate}
        endDate={settings.range.endDate}
        rectSize={settings.display.rectSize}
        legendCellSize={settings.display.legendCellSize}
        space={settings.display.space}
        width={width}
        height={height}
        legend={settings.display.legend}        
        rectRender={(props, data) => (
          /* if (!data.count) return <rect {...props} />;*/ <Tooltip
            key={props.key}
            placement="top"
            content={TooltipContent({
              date: data.date,
              count: data.count || 0,
            })}
            delay={300}
          >
            <rect
              {...props}
              onClick={() => {
                window.roamAlphaAPI.ui.mainWindow.openPage({
                  page: { uid: toRoamDateUid(getDateFromString(data.date)) },
                });
              }}
            />
          </Tooltip>
        )}
      />
    </div>
  );
};

export const renderHeatmap = (
  settings: HeatMapSettings,
  blockUid: string,
  p: HTMLElement
): void => {
  ReactDOM.render(
    <Heatmap
      settings={settings}
      blockUid={blockUid}
    />,
    p
  );
};

export default Heatmap;
