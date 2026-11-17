const accessTokenMaxAge = process.env.ACCESS_TOKEN_MAX_AGE ?? "15m";
const refreshTokenMaxAgeSeconds = Number(
  process.env.REFRESH_TOKEN_MAX_AGE_SECONDS ?? "2592000",
);

if (
  !Number.isInteger(refreshTokenMaxAgeSeconds) ||
  refreshTokenMaxAgeSeconds <= 0
) {
  throw new Error(
    "REFRESH_TOKEN_MAX_AGE_SECONDS must be a positive integer",
  );
}

export const AUTH_CONFIG = {
  accessTokenMaxAge,
  refreshTokenMaxAgeSeconds,
  refreshTokenMaxAgeMs: refreshTokenMaxAgeSeconds * 1000,
} as const;