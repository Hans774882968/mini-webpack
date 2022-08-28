import { add, minus, f } from './utils';
import { format, dis } from './date/date';
import { dis as alsoDis } from './g';
import { fac1 } from './fac_demo/fac1';
import { fac22 } from './fac_demo/fac2';

console.log(add(10, 20, 30, 40));// 100
console.log(minus(20, 5));// 15
console.log(format(new Date()));// 2022-08-28 19:03:45
console.log(f());// ?
console.log(dis(1, 1, 1), +alsoDis(1, 1, 1) + 1.5);// 1.73 3.23
console.log(fac1(6), fac22(6));// 720 720
