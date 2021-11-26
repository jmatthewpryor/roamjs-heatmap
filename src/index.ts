import {
  addStyle,
  toConfig,
  runExtension,
  createButtonObserver,
  getUidsFromButton,
  getTreeByBlockUid,
  getTreeByPageName,
  parseRoamDate,
  TreeNode
} from "roam-client";
import { createConfigObserver } from "roamjs-components";
import { renderHeatmap } from "./Heatmap";
import { addDays, subDays, parse, differenceInDays, startOfDay, endOfDay } from "date-fns";
import merge from "ts-deepmerge";
import { HeatMapSettings } from "./components/heatmap";

const ID = "heatmap";
const RANGE = "range";
const RANGE_DAYS = "days";
const RANGE_START_DATE = "startDate";
const RANGE_END_DATE = "endDate";
const QUERY = "query";
const QUERY_REFS = "refs";
const LEGEND = "legend";
const DISPLAY = "display";
const DISPLAY_DARK = "darkMode";
const DISPLAY_RECT_SIZE = "rectSize";
const DISPLAY_SPACE = "space";
const DISPLAY_LEGEND_CELL_SIZE = "legendCellSize";

const CONFIG = toConfig(ID);

const getKeyValue = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];

function isNumeric(str: any) {
  return isNaN(Number(str)) ? false : true;
}

function isBoolean(str: any){
  return (/true/i).test(str)? true: (/false/i).test(str)? true: false;
}

function parseBoolean(str: any){
  return (/true/i).test(str)? true: (/false/i).test(str)? false: undefined;
}

function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d.getTime());
}
type Options = {
  [key: string]: any
}

function parseConfig( tree: TreeNode): Options | string[] | string | number[] | number | boolean | undefined {
  const obj: Options = {};
  if (tree.children && tree.children.length > 0) {
    tree.children.forEach(child => {
      if (child.text) {
        obj[child.text] = parseConfig(child);
      }
    });
    if (Object.keys(obj).filter((key) => obj[key] !== undefined).length == 0) {
      let result = Object.keys(obj);
      result = result.map((key) => key.replace("[[", "").replace("]]", ""));
      let result1 = result.map((key) => isNumeric(key) ? parseInt(key) : isValidDate(parseRoamDate(key)) ? parseRoamDate(key) : isBoolean(key)? parseBoolean(key): key);
      return result1.length > 1 ? result1 : result1[0];
    }
    return obj;
  } else {
    return undefined;
  }
}

addStyle(`
  svg.roamjs-heatmap {
    color: #24292e;
    -webkit-user-select: none;
            user-select: none;
    display: block;
    font-size: 10px;
  }
  svg.roamjs-heatmap rect {
    display: block;
    cursor: pointer;
  }
  svg.roamjs-heatmap rect:hover {
    stroke: rgba(0, 0, 0, 0.14);
    stroke-width: 1px;
  }
  svg.roamjs-heatmap rect:active {
    fill: #196127;
    stroke-width: 0;
  }
  svg.roamjs-heatmap text {
    text-anchor: middle;
    font-size: inherit;
    fill: currentColor;
  }
  .roamjs-heatmap .legend-0 {
    fill: #EBEDF0;
  }
  .roamjs-heatmap .legend-4 {
    fill: #C6E48B;
  }
  .roamjs-heatmap .legend-8  {
    fill: #7BC96F;
  }
  .roamjs-heatmap .legend-12 {
    fill: #239A3B;
  }
  .roamjs-heatmap .legend-32 {
    fill: #196127;
  }
`);

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
              description: "query",
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
      const defaultSettings: HeatMapSettings = {
        display: {
          rectSize: 11,
          space: 2,
          legendCellSize: 11,
          prefixCls: "roamjs-heatmap",
          legend: [0, 4, 8, 12, 32],
        },
        range: {
          days: 365,
        },
        debug: false
      };

      let tree = getTreeByBlockUid(blockUid);
      let config: HeatMapSettings = parseConfig(tree) as HeatMapSettings;
      config = merge.withOptions(
        { mergeArrays: false },
        defaultSettings, config);

      if (config.range.startDate && config.range.endDate) {
        config.range.endDate = endOfDay(config.range.endDate);
        config.range.startDate = startOfDay(config.range.startDate);
        config.range.days = differenceInDays(config.range.endDate, config.range.startDate);
      }
      else if (config.range?.endDate) {
        config.range.endDate = endOfDay(config.range.endDate);
        config.range.startDate = subDays(config.range.endDate, config.range.days);
      }
      else if (config.range?.startDate) {
        config.range.startDate = startOfDay(config.range.startDate);
        config.range.endDate = addDays(config.range.startDate, config.range.days);
      }
      else {
        config.range.endDate = new Date();
        config.range.startDate = subDays(config.range.endDate, config.range.days);
      }
      
      // make sure the query refs are an array, not just a single string
      if (typeof config.query?.refs === "string") {
        config.query.refs = [config.query.refs];
      }

      if (config.debug) {
        console.log("CONFIG:", config);
      }

      renderHeatmap(
        config,
        blockUid,
        b.parentElement
      );
    },
  });
});

