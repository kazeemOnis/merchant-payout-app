/**
 * `react-native-gifted-charts` mutates data items in place (e.g. adds `isActiveClone`).
 * Frozen / non-extensible objects (shared module refs, StyleSheet outputs, reused
 * style objects) can throw "Cannot add new property". Always pass shallow-cloned
 * rows and per-point style objects.
 */
export function shallowCloneChartData<T extends object>(
  data: readonly T[],
): T[] {
  return data.map(row => ({ ...row }));
}
