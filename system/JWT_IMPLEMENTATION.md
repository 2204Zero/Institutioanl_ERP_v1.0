# JWT Token Implementation Guide

## 1. Token Properties
- **Access Token**: HMAC SHA-512 signed JWT token with 15-minute expiration time. Contains claims `sub`, `username`, `role`, and `permissions`.
- **Refresh Token**: Cryptographically secure random UUID token stored in `RefreshTokens` database table with 7-day expiration time.

## 2. Refresh Token Rotation
Upon calling `POST /api/v1/auth/refresh`, the old refresh token is revoked and replaced with a newly issued token pair (Token Rotation Strategy) to mitigate token theft attacks.
