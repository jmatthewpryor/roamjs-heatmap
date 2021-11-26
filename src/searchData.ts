import { HeatMapValue } from './components/heatmap';
import { addDays, differenceInDays, format } from 'date-fns'
import {parseRoamDate} from 'roam-client';

function isDatePage(name: string) {
  if (!name) return false;
  return name.match(/^\w+\s\d\d?..,\s\d\d\d\d$/);
}

function parseDatePage(name: string) {
  if (!isDatePage(name)) return null;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dateParts = name.split(" ");
  const month = months.indexOf(dateParts[0]);
  const day = parseInt(dateParts[1].substring(0, dateParts[1].length - 2), 10);
  const year = parseInt(dateParts[2], 10);
  return new Date(year, month, day);
}

function getPageName(node: any, debug: boolean=false): string {
  if (debug) {
    console.log("getPageName>", "Node:", node);
  }
  if (node?.title) {
    return node.title;
  } else if (node?._children) {
    return getPageName(node._children[0]);
  }
  return null;
}

export function getPageCalData(pages: string[], startDate: Date, endDate: Date, debug: boolean=false): HeatMapValue[] {
  const values: HeatMapValue[] = [];
  const dateRange = differenceInDays(endDate, startDate) + 3;

  for (let i = 0; i <= dateRange; i++) {
    values.push({ date: format(addDays(startDate, i), 'yyyy/MM/dd'), count: 0, content: '' },);
  }
  
  const refs = pages
    .map((page) =>
      window.roamAlphaAPI.q(`
            [:find 
                (pull ?block [:node/title {:block/_children ...}]) 
                :where [?block :block/refs ?ref] [?ref :node/title "${page}"]]`)
    )
    .flat();
    
  if (refs?.length) {
      const dates = refs
      .map((n) => getPageName(n[0], debug))
      .filter(isDatePage)
      .map(parseDatePage);
    if (dates.length == 0) return values;
    dates.forEach((d) => {
      values.filter((v) => v.date == format(d, 'yyyy/MM/dd')).forEach((v) => {
        v.count++;
      });
    });
  }
  return values;
}


