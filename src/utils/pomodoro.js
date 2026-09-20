export function getRemainingSeconds(
  targetEndTimestamp,
  currentTimestamp = Date.now(),
) {
  if (
    typeof targetEndTimestamp !== "number" ||
    !Number.isFinite(targetEndTimestamp)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.ceil((targetEndTimestamp - currentTimestamp) / 1000),
  );
}
