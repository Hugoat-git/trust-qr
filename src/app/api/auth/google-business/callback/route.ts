import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  listAccounts,
  listLocations,
} from '@/lib/google-business';
import { supabaseAdmin } from '@/lib/supabase';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://trustqr.dev';

/**
 * GET /api/auth/google-business/callback?code=...&state=...
 *
 * Handles the OAuth2 callback from Google.
 * 1. Exchanges the code for tokens
 * 2. Fetches the user's GBP accounts + locations
 * 3. Tries to auto-select the right location (by name matching)
 * 4. Saves tokens + location to DB
 * 5. Redirects to admin settings page
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Decode state to get restaurantId + slug
  let restaurantId: string;
  let slug: string;

  try {
    const decoded = JSON.parse(Buffer.from(state ?? '', 'base64url').toString());
    restaurantId = decoded.restaurantId;
    slug = decoded.slug;
  } catch {
    return NextResponse.redirect(`${APP_URL}/admin?error=invalid_state`);
  }

  const settingsUrl = `${APP_URL}/admin/${slug}/settings`;

  if (error || !code) {
    return NextResponse.redirect(`${settingsUrl}?gbp_error=${encodeURIComponent(error || 'no_code')}`);
  }

  try {
    // 1. Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;
    const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000).toISOString();

    // 2. Fetch accounts & their locations
    // If the My Business API is not enabled or the user has no GBP account, catch gracefully
    let accounts: Awaited<ReturnType<typeof listAccounts>> = [];
    try {
      accounts = await listAccounts(accessToken);
    } catch (listErr) {
      console.warn('Could not list GBP accounts (API not enabled or no account):', listErr);
      // Save tokens anyway — they may add a business profile later
      await (supabaseAdmin.from('restaurants') as any)
        .update({
          google_refresh_token: refreshToken,
          google_access_token: accessToken,
          google_token_expiry: expiresAt,
          google_account_name: null,
          google_location_name: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurantId);
      return NextResponse.redirect(`${settingsUrl}?gbp_no_business=1`);
    }

    let selectedAccountName: string | null = null;
    let selectedLocationName: string | null = null;

    if (accounts.length > 0) {
      // Try to find the right location by matching the restaurant name
      // biome-ignore lint/suspicious/noExplicitAny: Supabase type inference issue
      const { data: restaurant } = await (supabaseAdmin.from('restaurants') as any)
        .select('name')
        .eq('id', restaurantId)
        .single();

      const restaurantName = (restaurant as { name?: string } | null)?.name?.toLowerCase() ?? '';

      for (const account of accounts) {
        const locations = await listLocations(accessToken, account.name);
        const match = locations.find(l =>
          l.title.toLowerCase().includes(restaurantName) ||
          restaurantName.includes(l.title.toLowerCase())
        );

        if (match) {
          selectedAccountName = account.name;
          selectedLocationName = match.name;
          break;
        }

        // If no match found in first account with multiple locations, use first location of first account
        if (!selectedAccountName && locations.length > 0) {
          selectedAccountName = account.name;
          selectedLocationName = locations[0].name;
        }
      }
    }

    // 3. Save to DB
    // biome-ignore lint/suspicious/noExplicitAny: dynamic GBP columns
    await (supabaseAdmin.from('restaurants') as any)
      .update({
        google_refresh_token: refreshToken,
        google_access_token: accessToken,
        google_token_expiry: expiresAt,
        google_account_name: selectedAccountName,
        google_location_name: selectedLocationName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', restaurantId);

    // 4. Redirect back to settings with success
    const successParam = selectedLocationName ? 'gbp_connected' : 'gbp_connected_no_location';
    return NextResponse.redirect(`${settingsUrl}?${successParam}=1`);
  } catch (err) {
    console.error('GBP OAuth callback error:', err);
    const message = err instanceof Error ? err.message : 'unknown';
    return NextResponse.redirect(`${settingsUrl}?gbp_error=${encodeURIComponent(message)}`);
  }
}
