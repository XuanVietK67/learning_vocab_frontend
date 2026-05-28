export const ACCESS_COOKIE = "lexa_access";
export const REFRESH_COOKIE = "lexa_refresh";

// Access token lifetime matches the backend JWT (15m); refresh matches the
// backend refresh token (30d). Keep these in sync with backend config.
export const ACCESS_MAX_AGE = 60 * 15;
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;
