export function dis (x: number, y: number, z: number) {
  const { sqrt } = Math;
  return sqrt(x ** 2 + y ** 2 + z ** 2).toFixed(2);
}
