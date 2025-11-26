/**
 * Database abstraction layer.
 * 
 * This module exports a database adapter that can be swapped between providers
 * (Neon, Supabase, PlanetScale, etc.) without changing application code.
 * 
 * Usage:
 *   import { db } from '@/lib/db';
 *   const stories = await db.getStories();
 */

export * from './types';

// Import adapters
import { NeonAdapter } from './neon';
import type { DatabaseAdapter } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Provider selection
// ─────────────────────────────────────────────────────────────────────────────

type DbProvider = 'neon' | 'supabase';

// Determine which provider to use based on environment
function getProvider(): DbProvider {
  // If Neon DATABASE_URL is set, use Neon
  if (process.env.EXPO_PUBLIC_DATABASE_URL) {
    return 'neon';
  }
  // Fall back to Supabase if configured
  if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
    return 'supabase';
  }
  // Default to Neon
  return 'neon';
}

// ─────────────────────────────────────────────────────────────────────────────
// Create and export the database instance
// ─────────────────────────────────────────────────────────────────────────────

function createAdapter(): DatabaseAdapter {
  const provider = getProvider();
  
  switch (provider) {
    case 'neon':
      return new NeonAdapter();
    case 'supabase':
      // For now, throw if trying to use Supabase adapter (we're migrating away)
      // You could implement a SupabaseAdapter here if needed for fallback
      throw new Error('Supabase adapter not implemented. Use Neon.');
    default:
      throw new Error(`Unknown database provider: ${provider}`);
  }
}

// Export the singleton database instance
export const db: DatabaseAdapter = createAdapter();

// Also export the adapter classes for direct use if needed
export { NeonAdapter } from './neon';
