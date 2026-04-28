import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { auditReport } = await request.json();

    if (!auditReport) {
      return NextResponse.json({ summary: "No data provided. Please execute a scan first." }, { status: 400 });
    }

    let summary = "";
    if (auditReport.status === "CRITICAL_FRAUD") {
      summary = `Sage Alert: High-risk detected. This label is flagged for ${auditReport.flags?.[0] || 'fraud'}. Do not proceed with payment.`;
    } else if (auditReport.score >= 85) {
      summary = `Sage says: This waybill is fresh and verified for delivery to ${auditReport.carrier || 'the destination'}. It is safe to pay.`;
    } else {
      summary = `Sage Warning: This label has anomalies. Score is ${auditReport.score}. Proceed with caution.`;
    }

    return NextResponse.json({ summary });

  } catch (error) {
    return NextResponse.json({ summary: "Sage is currently offline." }, { status: 500 });
  }
}
