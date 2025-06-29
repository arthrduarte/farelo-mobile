export const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

export const applyNotIn = (query: any, column: string, ids: string[]) => {
  if (!ids || ids.length === 0) return query;

  const safeList = ids.filter(Boolean);
  if (safeList.length === 0) return query;

  return query.not(column, 'in', `(${safeList.join(',')})`);
};
