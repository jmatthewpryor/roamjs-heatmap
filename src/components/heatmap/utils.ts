import { SVGProps, HeatMapValue } from './SVG';
import { parse, format } from 'date-fns'

export function isValidDate(date: Date) {
  return date instanceof Date && !isNaN(date.getTime());
}

export function getDateToString(date: Date) {
  return format(date, 'yyyy/MM/dd')
}

export function getDateFromString(date: string): Date {
  return parse(date, 'yyyy/MM/dd', new Date());
}

export function getDNPDateString(date: Date) {
  format(date, 'MM-dd-yyyy')
}


export function formatData(data: SVGProps['value'] = []) {
  const result: Record<string, HeatMapValue> = {};
  data.forEach((item) => {
    if (item.date && isValidDate(new Date(item.date))) {
      item.date = getDateToString(new Date(item.date));
      result[item.date] = item;
    }
  });
  return result;
}

/** 排序 比较函数 */
export function numberSort(keys: number[] = []) {
  return keys.sort((x, y) => {
    if (x < y) return -1;
    else if (x > y) return 1;
    return 0;
  });
}

export function findLegendBand(num: number = 0, nums: number[]): number {
  let band = 0;
  for (let a = 0; a < nums.length; a += 1) {
    if (nums[a] >= num) {
      band = nums[a];
      break;
    }
    band = nums[a];
  }
  return band;
}
