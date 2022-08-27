import { add, minus, f } from './utils';
import { format, dis } from './date/date';
import { dis as alsoDis } from './g';
console.log(add(10, 20, 30, 40));
console.log(minus(20, 5));
console.log(format(new Date()));
console.log(f());
console.log(dis(1, 1, 1), alsoDis(1, 1, 1));
