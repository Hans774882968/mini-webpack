import { getTimestampByUTCSeconds, format } from './date/date';

export const add = (...a: number[]) => {
  return a.reduce((tot, v) => tot + v, 0);
};

export const minus = (a: number, b: number) => {
  return a - b;
};

export const f = () => {
  return format(getTimestampByUTCSeconds(add(1, 3, 5)));
};
