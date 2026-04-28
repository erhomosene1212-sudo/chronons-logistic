import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { waybillNumber, reason, details } = await request.json();

    if (!waybillNumber) {
      return NextResponse.json({ error: "Waybill number required" }, { status: 400 });
    }

    // Persist to Supabase Global Registry
    const { error } = await supabase
      .from('fraud_registry')
      .insert([{ 
        waybill_number: waybillNumber.toUpperCase(), 
        reason, 
        details: details || `Reported via Protocol at ${new Date().toISOString()}`
      }]);
    
    if (error) {
      console.error("[SUPABASE ERROR]", error);
      return NextResponse.json({ error: "Cloud sync failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Waybill added to global blacklist" });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
