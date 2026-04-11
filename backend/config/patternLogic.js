module.exports = function getPatternLevel(count) {
  if (count >= 20) return "HIGHLY_RELIABLE";
  if (count >= 10) return "STRONG";
  if (count >= 5) return "CONFIRMED";
  return "LOW";
};
