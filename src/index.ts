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

function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d.getTime());
}
type Options = {
  [key: string]: any
}

function parseConfig( tree: TreeNode): Options | string[] | string | number[] | number | undefined {
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
      let result1 = result.map((key) => isNumeric(key) ? parseInt(key) : isValidDate(parseRoamDate(key)) ? parseRoamDate(key) : key);
      return result1.length > 1 ? result1 : result1[0];
    }
    return obj;
  } else {
    return undefined;
  }
}

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
        }
      };

      let tree = getTreeByBlockUid(blockUid);
      let config: HeatMapSettings = parseConfig(tree) as HeatMapSettings;
      console.log("ORIG CONFIG", config);
      config = merge.withOptions(
        { mergeArrays: false },
        defaultSettings, config);
      console.log("MERGED CONFIG", config);

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
      
      console.log(`FINAL CONFIG: `, config);

      renderHeatmap(
        config,
        blockUid,
        b.parentElement
      );
    },
  });
});

