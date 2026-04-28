/**
 * Chronos Trust Engine - Audit Protocol
 */

export function calculateTrustScore(waybillData, userAddress) {
  let score = 100;
  let flags = [];
  let status = "VERIFIED";

  // 1. ADAPTIVE DESTINATION CHECK (FUZZY MATCHING)
  const normalizedDest = waybillData.destination.toLowerCase().trim();
  const normalizedUser = userAddress.toLowerCase().trim();

  // Nigerian Geo-Keywords for high-confidence matching
  const geoKeywords = ["lagos", "abuja", "ikeja", "lekki", "maitama", "asokoro", "portharcourt", "ibadan", "kano", "kaduna", "yaba", "victoria island"];
  
  const hasGeoMatch = geoKeywords.some(k => normalizedDest.includes(k) && normalizedUser.includes(k));
  
  // Word similarity check (normalized for common variations)
  const userWords = normalizedUser.split(/[\s,]+/).filter(w => w.length > 3);
  const matchedWords = userWords.filter(w => normalizedDest.includes(w));
  const similarityScore = userWords.length > 0 ? (matchedWords.length / userWords.length) : 0;

  // If there's no exact match, no geo-keyword overlap, and low similarity, it's a fraud.
  if (normalizedDest !== normalizedUser && !hasGeoMatch && similarityScore < 0.4) {
    return {
      status: "CRITICAL_FRAUD",
      score: 0,
      grade: "F",
      flags: ["DESTINATION_MISMATCH"],
      message: `Destination mismatch: Label registered for ${waybillData.destination}.`,
      carrier: waybillData.carrier
    };
  }

  // 2. RECYCLED LABEL
  const createdDate = new Date(waybillData.createdDate);
  const now = new Date();
  const hoursAgo = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  
  if (hoursAgo >= 24) {
    score -= 40;
    flags.push("RECYCLED_LABEL");
  }

  // 3. VELOCITY CHECK
  // If the label has been queried too many times, it's likely leaked/reused
  if (waybillData.queryCount > 15) {
    score -= 30;
    flags.push("LEAKED_LABEL");
  }

  // Final Assessment
  let grade = "A";
  if (score >= 90) grade = "A";
  else if (score >= 70) grade = "B";
  else if (score >= 50) grade = "C";
  else {
    grade = "F";
    status = "WARNING";
  }

  if (score <= 60) status = "WARNING";

  return {
    status: status,
    score: Math.max(0, score),
    grade,
    flags,
    carrier: waybillData.carrier,
    timestamp: new Date().toISOString()
  };
}
