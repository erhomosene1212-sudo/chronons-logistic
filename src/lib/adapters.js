export const mockWaybills = {
  "GIG-1234": {
    trackingNumber: "GIG-1234",
    carrier: "GIG Logistics",
    destination: "No 12. Admiralty Way, Lekki, Lagos",
    createdDate: new Date().toISOString(), // Recent
    queryCount: 1,
    status: "IN_TRANSIT"
  },
  "SAF-5678": {
    trackingNumber: "SAF-5678",
    carrier: "Speedaf",
    destination: "Suite 405, Silverbird Galleria, Abuja",
    createdDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // Older than 24h
    queryCount: 5,
    status: "DELIVERED"
  },
  "DHL-9012": {
    trackingNumber: "DHL-9012",
    carrier: "DHL Express",
    destination: "Plot 3, Port Harcourt Road, Owerri",
    createdDate: new Date().toISOString(),
    queryCount: 20, // Velocity check fail
    status: "IN_TRANSIT"
  },
  "GIG-FRAUD": {
    trackingNumber: "GIG-FRAUD",
    carrier: "GIG Logistics",
    destination: "A different address",
    createdDate: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    queryCount: 50,
    status: "PICKED_UP"
  },
  "FED-1122": {
    trackingNumber: "FED-1122",
    carrier: "FedEx",
    destination: "No 5. Gana Street, Maitama, Abuja",
    createdDate: new Date().toISOString(),
    queryCount: 2,
    status: "OUT_FOR_DELIVERY"
  }
};

export function detectCarrier(waybillNumber) {
  const upper = waybillNumber.toUpperCase();
  if (upper.startsWith("GIG-")) return "GIG";
  if (upper.startsWith("SAF-") || upper.startsWith("SPEEDAF-")) return "Speedaf";
  if (upper.startsWith("DHL-")) return "DHL";
  if (upper.startsWith("FED-") || upper.startsWith("FEDEX-")) return "FedEx";
  return "Unknown";
}

export function findMockWaybill(waybillNumber) {
  return mockWaybills[waybillNumber.toUpperCase()] || null;
}
