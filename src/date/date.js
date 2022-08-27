import { dis as _dis } from '../g';
const ts2date = (ts) => new Date(ts);
export const addLeadingZero = (t) => (t < 10 ? '0' : '') + t.toString();
var Months;
(function (Months) {
    Months[Months["Jan"] = 0] = "Jan";
    Months[Months["Feb"] = 1] = "Feb";
    Months[Months["Mar"] = 2] = "Mar";
    Months[Months["Apr"] = 3] = "Apr";
    Months[Months["May"] = 4] = "May";
    Months[Months["Jun"] = 5] = "Jun";
    Months[Months["Jul"] = 6] = "Jul";
    Months[Months["Aug"] = 7] = "Aug";
    Months[Months["Sept"] = 8] = "Sept";
    Months[Months["Oct"] = 9] = "Oct";
    Months[Months["Nov"] = 10] = "Nov";
    Months[Months["Dec"] = 11] = "Dec";
})(Months || (Months = {}));
export function getTimestampByUTCSeconds(UTCSeconds) {
    if (!UTCSeconds) {
        return 0;
    }
    const localDate = new Date(UTCSeconds);
    const localDateTimestamp = localDate.getTime();
    const timezoneOffset = localDate.getTimezoneOffset() / 60; // getTimezoneOffset()返回是以分钟为单位，需要转化成h
    const timezone = 8;
    return localDateTimestamp + (+timezone + timezoneOffset) * 3600000;
}
export function format(date, unit = 'second', ifTimeTransform = true) {
    if (!date) {
        return '';
    }
    if (typeof date === 'string')
        return date;
    if (typeof date === 'number') {
        // 处理前后端标准时间戳相差 3 位的问题
        if (date.toString().length === 10) {
            date *= 1000;
        }
        if (ifTimeTransform) {
            date = getTimestampByUTCSeconds(date);
        }
        date = ts2date(date);
    }
    const year = addLeadingZero(date.getFullYear());
    const month = addLeadingZero(date.getMonth() + 1);
    const day = addLeadingZero(date.getDate());
    const hour = addLeadingZero(date.getHours());
    const minute = addLeadingZero(date.getMinutes());
    const second = addLeadingZero(date.getSeconds());
    if (unit === 'year')
        return `${year}`;
    if (unit === 'month')
        return `${year}-${month}`;
    if (unit === 'day')
        return `${year}-${month}-${day}`;
    if (unit === 'hour')
        return `${year}-${month}-${day} ${hour}`;
    if (unit === 'minute')
        return `${year}-${month}-${day} ${hour}:${minute}`;
    if (unit === 'second')
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    if (unit === 'hour2second')
        return `${hour}:${minute}:${second}`;
    if (unit === 'reverseDay')
        return `${day} ${Months[+month]} ${year}`;
}
export const dis = _dis;
