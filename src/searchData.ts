import { HeatMapValue } from './components/heatmap';
import { isValidDate } from './components/heatmap/utils';
import { addDays, differenceInDays, format } from 'date-fns'
import {parseRoamDate} from 'roam-client';

function isDatePage(name: string) {
  if (!name) return false;
  return isValidDate(parseRoamDate(name));
}

export function getPageCalData(
  pages: string[],
  startDate: Date,
  endDate: Date,
  debug: boolean = false
): HeatMapValue[] {
  const values: HeatMapValue[] = [];
  const dateRange = differenceInDays(endDate, startDate) + 3;

  for (let i = 0; i <= dateRange; i++) {
    values.push({
      date: format(addDays(startDate, i), "yyyy/MM/dd"),
      count: 0,
      content: "",
    });
  }

  if (debug) {
    console.log("HEATMAP> getPageCalData>", "Pages:", pages);
  }

  pages.map((page) => {
    let found = window.roamAlphaAPI.q(`
      [:find ?page_title 
          (pull ?block [:block/string :block/refs :block/page]) 
          :where [?block :block/refs ?ref]
            [?block :block/page ?page]
            [?page :node/title ?page_title]
            [?ref :node/title "${page}"]]`);

    if (debug) {
      console.log("HEATMAP> getPageCalData>", "Refs:", found);
    }

    if (found?.length) {
      const dates = found
        .filter((n) => isDatePage(n[0]))
        .map((n) => {
          const date = parseRoamDate(n[0]);
          const blockContent = n[1].string;

          const regex = new RegExp(
            `#?\\[\\[(${page})\\]\\]|#(${page})|(${page})::(\\d+)`,
            "g"
          );

          const iter = blockContent.matchAll(regex);
          let matchAll = Array.from(iter);
          let total = 0;
          matchAll.forEach((m: any) => {
            let tagIdx = m.findIndex((n: any) => n === page);
            let count = 1;
            if (m[tagIdx + 1]) {
              count = parseInt(m[tagIdx + 1]);
            }
            total += count;
          });
          if (debug) {
            console.log(`HEATMAP> getPageCalData> Page: ${page}`, "Date:", date, "Total:", total);
          }      
          values
            .filter((v) => v.date == format(date, "yyyy/MM/dd"))
            .forEach((v) => {
              v.count += total;
            });
        });
    }
  });

  return values;
}
