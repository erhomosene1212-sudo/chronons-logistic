import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { auditReport, waybillNumber } = await request.json();

    if (!auditReport) {
      return NextResponse.json({ brief: "System offline. Unable to generate voice brief." }, { status: 400 });
    }

    let brief = "";

    if (auditReport.status === "CRITICAL_FRAUD") {
      const reason = auditReport.flags?.[0] || "security mismatch";
      brief = `CRITICAL ALERT: Waybill ${waybillNumber || 'detected'} is flagged for ${reason.replace('_', ' ')}. Do not proceed with payment. Repeat, do not pay for this delivery.`;
    } else if (auditReport.grade === "A") {
      brief = `Verification Successful. Waybill ${waybillNumber || ''} is fresh and registered for delivery to Nigeria. Trust score is ${auditReport.score}. It is safe to proceed.`;
    } else {
      brief = `Attention: ${waybillNumber || 'This label'} has potential anomalies. Trust grade is ${auditReport.grade}. Review the flags before authorizing payment.`;
    }

    return NextResponse.json({ brief });

  } catch (error) {
    return NextResponse.json({ brief: "Sage Voice Protocol error." }, { status: 500 });
  }
}
