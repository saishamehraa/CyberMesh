// apps/backend/src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use Service Role to bypass RLS on backend

export const supabase = createClient(supabaseUrl, supabaseKey);

export class RealtimeBroadcaster {
  private channel = supabase.channel('cybermesh-orchestration');

  constructor() {
    this.channel.subscribe((status) => {
      console.log(`[Supabase] Realtime status: ${status}`);
    });
  }

  async broadcastEvent(type: string, payload: any) {
    await this.channel.send({
      type: 'broadcast',
      event: type,
      payload: { ...payload, timestamp: new Date().toISOString() },
    });
  }
}

export const realtime = new RealtimeBroadcaster();
