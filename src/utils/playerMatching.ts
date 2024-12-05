import { Player } from "@/types/player";

function normalizeString(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);
  
  // Exact match
  if (s1 === s2) return 1;
  
  // One string contains the other
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Calculate character similarity
  let matches = 0;
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  for (let i = 0; i < shorter.length; i++) {
    if (longer[i] === shorter[i]) matches++;
  }
  
  return matches / longer.length;
}

export const findBestMatchingPlayer = (name: string, players: Player[]): Player | null => {
  console.log(`Trying to match player name: "${name}"`);
  
  let bestMatch: Player | null = null;
  let bestSimilarity = 0;
  
  players.forEach(player => {
    const similarity = calculateSimilarity(name, player.name);
    console.log(`Comparing "${name}" with "${player.name}" - Similarity: ${similarity}`);
    
    if (similarity > bestSimilarity && similarity > 0.7) { // Threshold of 0.7 for minimum similarity
      bestSimilarity = similarity;
      bestMatch = player;
    }
  });
  
  console.log(`Best match for "${name}": ${bestMatch?.name || 'No match found'} (similarity: ${bestSimilarity})`);
  return bestMatch;
};