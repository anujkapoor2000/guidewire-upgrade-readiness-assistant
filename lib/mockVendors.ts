export function createVendorMockResponse(vendor: string, requestBody: any) {
  switch (vendor.toLowerCase()) {
    case "fraud":
      return {
        vendor: "fraud",
        claimNumber: requestBody.claimNumber ?? "UNKNOWN",
        fraudScore: 72,
        riskBand: "MEDIUM",
        referralRequired: true,
        reasons: ["High claim amount", "Recent policy inception"]
      };

    case "document":
      return {
        vendor: "document",
        documentId: `DOC-${Date.now()}`,
        status: "GENERATED",
        documentType: requestBody.documentType ?? "UNKNOWN",
        deliveryChannel: requestBody.deliveryChannel ?? "EMAIL"
      };

    case "payment":
      return {
        vendor: "payment",
        paymentReference: `PAY-${Date.now()}`,
        status: "ACCEPTED",
        amount: requestBody.amount,
        currency: requestBody.currency ?? "GBP"
      };

    case "address":
      return {
        vendor: "address",
        status: "VALIDATED",
        normalisedAddress: {
          line1: requestBody.line1,
          city: requestBody.city,
          postcode: String(requestBody.postcode ?? "").toUpperCase(),
          country: requestBody.country ?? "GB"
        }
      };

    default:
      return {
        vendor,
        status: "MOCK_RESPONSE",
        echo: requestBody
      };
  }
}