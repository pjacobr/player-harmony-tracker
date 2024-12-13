export const sortByName = <T extends { name: string }>(a: T, b: T, ascending: boolean) => {
  return ascending ? 
    a.name.localeCompare(b.name) : 
    b.name.localeCompare(a.name);
};

export const sortByKDA = (a: { kda: string }, b: { kda: string }, ascending: boolean) => {
  return ascending ? 
    Number(a.kda) - Number(b.kda) : 
    Number(b.kda) - Number(a.kda);
};

export const sortByKDSpread = (a: { kdSpread: number }, b: { kdSpread: number }, ascending: boolean) => {
  return ascending ? 
    a.kdSpread - b.kdSpread : 
    b.kdSpread - a.kdSpread;
};