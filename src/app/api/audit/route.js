import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateTrustScore } from '@/lib/engine';

export async function POST(request) {
  try {
    const { waybillNumber, userAddress } = await request.json();

    if (!waybillNumber || !userAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cleanNumber = waybillNumber.toUpperCase().trim();

    // 1. LIVE CHECK: Supabase Fraud Registry
    const { data: fraudData, error: fraudError } = await supabase
      .from('fraud_registry')
      .select('*')
      .eq('waybill_number', cleanNumber)
      .single();

    if (fraudData) {
      return NextResponse.json({
        status: "CRITICAL_FRAUD",
        score: 0,
        grade: "F",
        flags: ["BLACKLISTED_LABEL"],
        message: `Global Registry Match: This waybill was blacklisted on ${new Date(fraudData.created_at).toLocaleDateString()}. Reason: ${fraudData.reason}`,
        carrier: "ALREADY BLACKLISTED"
      });
    }

    // 2. DYNAMIC FETCHER (Simulating real-world courier query)
    // Normally this would fetch from GIG/DHL API. 
    // For production hardening, we simulate the courier data if it's not in our fraud list.
    const mockCouriers = {
      "GIG": "GIG Logistics",
      "SAF": "Speedaf",
      "DHL": "DHL Express",
      "FED": "FedEx"
    };
    
    const prefix = cleanNumber.split('-')[0];
    const carrierName = mockCouriers[prefix] || "Independent Courier";

    // Dynamic data generation (simulating a "Live" hit)
    const waybillData = {
      trackingNumber: cleanNumber,
      carrier: carrierName,
      destination: "Lagos, Nigeria", // Defaulting for the audit logic to work
      createdDate: new Date().toISOString(),
      queryCount: 1,
      status: "IN_TRANSIT"
    };

    // 3. RUN AUDIT ENGINE
    const auditReport = calculateTrustScore(waybillData, userAddress);

    return NextResponse.json(auditReport);

  } catch (error) {
    console.error("Audit API Error:", error);
    return NextResponse.json({ error: "Audit Protocol Failure. Check System Logs." }, { status: 500 });
  }
}
