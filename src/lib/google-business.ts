/**
 * Google Business Profile (GBP) API client
 *
 * Used when a restaurant owner has connected their Google Business account via OAuth.
 * Provides real-time review access (vs Places API which can be cached 24-72h).
 *
 * OAuth scopes required: https://www.googleapis.com/auth/business.manage
 * API version: v4 (My Business API)
 */

import { supabaseAdmin } from '@/lib/supabase';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trustqr.dev';

export const GBP_OAUTH_REDIRECT_URI = `${APP_URL}/api/auth/google-business/callback`;
export const GBP_SCOPES = 'https://www.googleapis.com/auth/business.manage';

export interface GBPReview {
  name: string;          // e.g. "accounts/xxx/locations/yyy/reviews/zzz"
  reviewId: string;
  reviewer: { displayName: string; profilePhotoUrl?: string };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;    // ISO 8601 timestamp
  updateTime: string;
}

interface GBPAccount {
  name: string;          // e.g. "accounts/123456789"
  accountName: string;
  type: string;
}

interface GBPLocation {
  name: string;          // e.g. "accounts/xxx/locations/yyy"
  title: string;
}

/**
 * Generates the Google OAuth2 authorization URL.
 * The state parameter encodes restaurantId + slug for the callback.
 */
export function buildOAuthUrl(restaurantId: string, slug: string): string {
  if (!GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID not configured');

  const state = Buffer.from(JSON.stringify({ restaurantId, slug })).toString('base64url');

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GBP_OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: GBP_SCOPES,
    access_type: 'offline',
    prompt: 'consent',  // Force refresh_token issuance on every authorization
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

/**
 * Exchanges an authorization code for access + refresh tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GBP_OAUTH_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  return response.json();
}

/**
 * Refreshes an expired access token using the stored refresh token.
 * Saves the new access token + expiry to the DB.
 */
export async function refreshAccessToken(restaurantId: string, refreshToken: string): Promise<string> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await response.json();
  const accessToken: string = data.access_token;
  const expiresIn: number = data.expires_in ?? 3600;
  const expiry = new Date(Date.now() + expiresIn * 1000).toISOString();

  // Persist the new access token
  // biome-ignore lint/suspicious/noExplicitAny: dynamic column
  await (supabaseAdmin.from('restaurants') as any)
    .update({ google_access_token: accessToken, google_token_expiry: expiry })
    .eq('id', restaurantId);

  return accessToken;
}

/**
 * Returns a valid access token for the restaurant, refreshing if needed.
 */
export async function getValidAccessToken(restaurant: {
  id: string;
  google_access_token: string | null;
  google_refresh_token: string | null;
  google_token_expiry: string | null;
}): Promise<string> {
  if (!restaurant.google_refresh_token) {
    throw new Error('No refresh token stored — GBP not connected');
  }

  // Check if access token is still valid (with 60s buffer)
  if (restaurant.google_access_token && restaurant.google_token_expiry) {
    const expiry = new Date(restaurant.google_token_expiry).getTime();
    if (Date.now() + 60_000 < expiry) {
      return restaurant.google_access_token;
    }
  }

  return refreshAccessToken(restaurant.id, restaurant.google_refresh_token);
}

/**
 * Fetches the list of GBP accounts for the authenticated user.
 */
export async function listAccounts(accessToken: string): Promise<GBPAccount[]> {
  const response = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list GBP accounts: ${err}`);
  }

  const data = await response.json();
  return data.accounts ?? [];
}

/**
 * Fetches the list of locations (establishments) for a GBP account.
 */
export async function listLocations(accessToken: string, accountName: string): Promise<GBPLocation[]> {
  const response = await fetch(`https://mybusiness.googleapis.com/v4/${accountName}/locations?readMask=name,title`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list GBP locations: ${err}`);
  }

  const data = await response.json();
  return data.locations ?? [];
}

/**
 * Fetches the most recent reviews for a location.
 * Returns up to 50 reviews sorted by newest first.
 */
export async function listReviews(accessToken: string, locationName: string): Promise<GBPReview[]> {
  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50&orderBy=updateTime%20desc`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list GBP reviews: ${err}`);
  }

  const data = await response.json();
  return data.reviews ?? [];
}

/**
 * Checks if there is any new review since a given timestamp.
 * Used in verifyPendingReviews() when GBP tokens are available.
 */
export async function hasNewGBPReview(
  restaurant: {
    id: string;
    google_access_token: string | null;
    google_refresh_token: string | null;
    google_token_expiry: string | null;
    google_account_name: string | null;
    google_location_name: string | null;
  },
  sinceIso: string  // ISO 8601 — participant.review_clicked_at
): Promise<boolean> {
  if (!restaurant.google_location_name) return false;

  const accessToken = await getValidAccessToken(restaurant);
  const reviews = await listReviews(accessToken, restaurant.google_location_name);

  const sinceMs = new Date(sinceIso).getTime();
  return reviews.some(r => new Date(r.createTime).getTime() > sinceMs);
}

/**
 * Revokes the GBP OAuth tokens and clears them from the DB.
 */
export async function disconnectGBP(restaurantId: string, accessToken: string): Promise<void> {
  // Revoke with Google
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
    method: 'POST',
  }).catch(() => { /* best-effort */ });

  // Clear from DB
  // biome-ignore lint/suspicious/noExplicitAny: dynamic columns
  await (supabaseAdmin.from('restaurants') as any)
    .update({
      google_refresh_token: null,
      google_access_token: null,
      google_token_expiry: null,
      google_account_name: null,
      google_location_name: null,
    })
    .eq('id', restaurantId);
}
