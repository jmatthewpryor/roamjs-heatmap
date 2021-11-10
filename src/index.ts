import { addStyle, toConfig, runExtension, createButtonObserver, getUidsFromButton, getTreeByBlockUid, getTreeByPageName, parseRoamDate } from "roam-client";
import { createConfigObserver } from "roamjs-components";
import { renderHeatmap } from "./Heatmap";
import { addDays, subDays, parse } from 'date-fns'

const ID = "heatmap";
const RANGE = "range";
const RANGE_DAYS = "days";
const RANGE_START_DATE = "startDate";
const RANGE_END_DATE = "endDate";
const QUERY = "query";
const QUERY_REFS = "refs";
const LEGEND = "legend";
const CONFIG = toConfig(ID);
runExtension(ID, () => {

  createConfigObserver({
    title: CONFIG,
    config: {
      tabs: [
        {
          id: "heatmap",
          fields: [
            {
              type: "text",
              title: "query",
              description:
                "query",
            },
          ],
        },
      ],
    },
  });

  createButtonObserver({
    shortcut: "heatmap",
    attribute: "heatmap-button",
    render: (b: HTMLButtonElement) => {
      const { blockUid } = getUidsFromButton(b);
      let endDate = null;
      let days = null;
      let startDate = null;
      let query: string[] = [];
      let legend: Record<number, string> = {};

      let tree = getTreeByBlockUid(blockUid);
      let rangeNode = tree.children.find(
        (c) => RANGE === c.text
      );
      if (rangeNode) {
        rangeNode.children.find(
          (c) => RANGE_DAYS === c.text
          )?.children.every((c) => days = parseInt(c.text));
          rangeNode.children.find(
            (c) => RANGE_START_DATE === c.text
            )?.children.every((c) => startDate = parseRoamDate(c.text));
            rangeNode.children.find(
              (c) => RANGE_END_DATE === c.text
              )?.children.every((c) => endDate = parseRoamDate(c.text));
              }
      
      let queryNode = tree.children.find(
        (c) => QUERY === c.text
      )?.children.find((c) => c.text === QUERY_REFS)?.children.forEach((c) => query.push(c.text.replace("[[","").replace("]]","")));
      
      let legendNode = tree.children.find(
        (c) => LEGEND === c.text
      )?.children.forEach((legendNode) => {
        legendNode.children.forEach((legendValueNode) => legend[parseInt(legendNode.text)] = legendValueNode.text);
      });
      if ( days ) {
        if ( startDate ) {
          endDate = addDays(startDate, days);
        }
        if (endDate) {
          startDate = subDays(endDate, days);
        }
        else {
          endDate = new Date();
          startDate = subDays(endDate, days);
        }
      }
      else {
        days = 365;
        if (endDate) {
          startDate = subDays(endDate, days);
        }
        else if (startDate) {
          endDate = addDays(startDate, days);
        }
        else {
          endDate = new Date();
          startDate = subDays(endDate, days);
        }
      }
      console.log(`QUERY: ${query} DAYS: ${days} START: ${startDate} END: ${endDate} LEGEND: `, legend);
      renderHeatmap(query, startDate, endDate, blockUid, b.parentElement);
    },
  });

});
