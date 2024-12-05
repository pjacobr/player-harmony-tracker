import { GameScore } from "@/types/gameScore";

export const calculateWinner = (scores: GameScore[], gameMode: string) => {
  if (gameMode === "Slayer") {
    // For Slayer, find the player with the highest kills
    const highestKills = Math.max(...scores.map((s) => s.kills));
    const winners = scores
      .filter((s) => s.kills === highestKills)
      .map((s) => s.player.name)
      .join(", ");
    return { winners, winningTeam: undefined };
  } else {
    // For other modes, use the existing team-based win logic
    const winners = scores
      .filter((s) => s.won)
      .map((s) => s.player.name)
      .join(", ");
    const winningTeam = scores.find((s) => s.won)?.team_number;
    return { winners, winningTeam };
  }
};