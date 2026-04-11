
export const normalizeCompanyName = (name = "") =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();


export const getCompanyKey = (name = "") =>
  normalizeCompanyName(name).toUpperCase();
