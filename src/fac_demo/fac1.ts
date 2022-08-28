import { fac2, fac22 } from './fac2';

export function fac1 (v: number) {
  if (v <= 0) return 1;
  return fac2(v);
}

export function fac11 (v: number) {
  return fac22(v);
}
