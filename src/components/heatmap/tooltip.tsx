import React from "react";
import { getDateFromString } from "./utils";
import { toRoamDate } from "roam-client";


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
  
  
  export const TooltipContent = ({
    date,
    count,
  }: {
    date: string;
    count: number;
  }): JSX.Element => {
    return (
      <div style={containerStyle}>
        {date&& 
        <div style={itemStyle}>
          <strong>{toRoamDate(getDateFromString(date))}</strong>
        </div>
        }
        <div style={itemStyle}>{count || 0}</div>
      </div>
    );
  };
  