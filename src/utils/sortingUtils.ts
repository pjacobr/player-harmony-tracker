export type SortOption = 'nameAsc' | 'scoreAsc' | 'scoreDesc';

export const sortByName = <T extends { name: string }>(a: T, b: T): number => {
  return a.name.localeCompare(b.name);
};

export const sortByScore = <T extends { kdSpread: number | string }>(a: T, b: T): number => {
  const scoreA = typeof a.kdSpread === 'string' ? parseFloat(a.kdSpread) : a.kdSpread;
  const scoreB = typeof b.kdSpread === 'string' ? parseFloat(b.kdSpread) : b.kdSpread;
  return scoreA - scoreB;
};

export const sortData = <T extends { name: string } & Record<string, any>>(
  data: T[],
  sortOption: SortOption
): T[] => {
  const sortedData = [...data];

  switch (sortOption) {
    case 'nameAsc':
      return sortedData.sort(sortByName);
    case 'scoreAsc':
      return sortedData.sort((a, b) => {
        if ('kdSpread' in a && 'kdSpread' in b) {
          return sortByScore(a as T & { kdSpread: number | string }, b as T & { kdSpread: number | string });
        }
        return 0;
      });
    case 'scoreDesc':
      return sortedData.sort((a, b) => {
        if ('kdSpread' in a && 'kdSpread' in b) {
          return -sortByScore(a as T & { kdSpread: number | string }, b as T & { kdSpread: number | string });
        }
        return 0;
      });
    default:
      return sortedData;
  }
};