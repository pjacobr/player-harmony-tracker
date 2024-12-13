export const sortByName = <T extends { name: string }>(a: T, b: T, ascending: boolean) => {
  return ascending ? 
    a.name.localeCompare(b.name) : 
    b.name.localeCompare(a.name);
};

export const sortByKDSpread = <T extends { kdSpread: number }>(a: T, b: T, ascending: boolean) => {
  return ascending ? 
    a.kdSpread - b.kdSpread : 
    b.kdSpread - a.kdSpread;
};

export type SortOption = 'nameAsc' | 'scoreAsc' | 'scoreDesc';

export const sortData = <T extends { name: string; kdSpread: number }>(
  data: T[], 
  sortOption: SortOption
): T[] => {
  const sortedData = [...data];
  
  switch (sortOption) {
    case 'nameAsc':
      return sortedData.sort((a, b) => a.name.localeCompare(b.name));
    case 'scoreAsc':
      return sortedData.sort((a, b) => a.kdSpread - b.kdSpread);
    case 'scoreDesc':
      return sortedData.sort((a, b) => b.kdSpread - a.kdSpread);
    default:
      return sortedData;
  }
};