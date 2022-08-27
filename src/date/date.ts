import { dis as _dis } from '../g';

const ts2date = (ts: number) => new Date(ts);

export const addLeadingZero = (t: number) => (t < 10 ? '0' : '') + t.toString();

enum Months {
  Jan,
  Feb,
  Mar,
  Apr,
  May,
  Jun,
  Jul,
  Aug,
  Sept,
  Oct,
  Nov,
  Dec,
}

export function getTimestampByUTCSeconds (UTCSeconds: number): number {
  if (!UTCSeconds) {
    return 0;
  }

  const localDate: Date = new Date(UTCSeconds);
  const localDateTimestamp: number = localDate.getTime();
  const timezoneOffset: number = localDate.getTimezoneOffset() / 60; // getTimezoneOffset()返回是以分钟为单位，需要转化成h
  const timezone = 8;
  return localDateTimestamp + (+timezone + timezoneOffset) * 3600000;
}

export function format (
  date: string | number | Date | undefined,
  unit = 'second',
  ifTimeTransform = true
): string | undefined {
  if (!date) {
    return '';
  }

  if (typeof date === 'string') return date;
  if (typeof date === 'number') {
    // 处理前后端标准时间戳相差 3 位的问题
    if ((date.toString() as any).length === 10) {
      date *= 1000;
    }
    if (ifTimeTransform) {
      date = getTimestampByUTCSeconds(date);
    }
    date = ts2date(date);
  }
  const year: string = addLeadingZero(date.getFullYear());
  const month: string = addLeadingZero(date.getMonth() + 1);
  const day: string = addLeadingZero(date.getDate());
  const hour: string = addLeadingZero(date.getHours());
  const minute: string = addLeadingZero(date.getMinutes());
  const second: string = addLeadingZero(date.getSeconds());
  if (unit === 'year') return `${year}`;
  if (unit === 'month') return `${year}-${month}`;
  if (unit === 'day') return `${year}-${month}-${day}`;
  if (unit === 'hour') return `${year}-${month}-${day} ${hour}`;
  if (unit === 'minute') return `${year}-${month}-${day} ${hour}:${minute}`;
  if (unit === 'second')
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  if (unit === 'hour2second') return `${hour}:${minute}:${second}`;
  if (unit === 'reverseDay') return `${day} ${Months[+month]} ${year}`;
}

export const dis = _dis;
