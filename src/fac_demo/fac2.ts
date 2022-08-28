import { fac1, fac11 } from './fac1';

export function fac2 (v: number) {
  return fac11(v);
}

export function fac22 (v: number) {
  const ret = v * fac1(v - 1);
  console.log(`return value of fac22(${v}) = ${ret}`);
  return ret;
}
