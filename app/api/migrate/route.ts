import { NextRequest, NextResponse } from 'next/server';
import postgres from 'postgres';
import { createClient } from '@supabase/supabase-js';

// Tables ordered to respect foreign key constraints
const TABLES = [
  'User',
  'Space',
  'Invite',
  'PushSubscription',
  'Notice',
  'Gossip',
  'Mood',
  'DailyClick',
  'NotificationQueue',
] as const;

export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  const migrationSecret = process.env.MIGRATION_SECRET;

  if (!migrationSecret || authHeader !== `Bearer ${migrationSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  const results: Record<string, number> = {};

  // Connect to source (Prisma Postgres) via TCP
  const source = postgres(process.env.PRISMA_DATABASE_URL!, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 30,
  });

  // Connect to destination (Supabase)
  const destination = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    for (const table of TABLES) {
      const data: Record<string, unknown>[] =
        await source.unsafe(`SELECT * FROM "${table}"`);

      if (data.length === 0) {
        results[table] = 0;
        continue;
      }

      // Upsert into Supabase in batches of 500
      const batchSize = 500;
      let inserted = 0;

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const { error } = await destination
          .from(table)
          .upsert(batch, { onConflict: 'id', ignoreDuplicates: true });

        if (error) {
          console.error(`Error upserting into ${table}:`, error);
          throw new Error(`Failed to upsert into ${table}: ${error.message}`);
        }

        inserted += batch.length;
      }

      results[table] = inserted;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    return NextResponse.json({
      success: true,
      timeTaken: `${elapsed}s`,
      tables: results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tablesCompleted: results,
      },
      { status: 500 },
    );
  } finally {
    await source.end();
  }
}
