import { Player } from "@/types/player";

export const findBestMatchingPlayer = (name: string, players: Player[]) => {
  const searchName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return players.find(player => {
    const playerName = player.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return playerName === searchName || 
           playerName.includes(searchName) || 
           searchName.includes(playerName);
  });
};