import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true });

export const contractSchemas = {
  fraudRequest: {
    type: "object",
    required: ["claimNumber", "lossDate", "claimAmount"],
    properties: {
      claimNumber: { type: "string" },
      lossDate: { type: "string" },
      claimAmount: { type: "number", minimum: 0 },
      policyNumber: { type: "string" }
    },
    additionalProperties: true
  },

  paymentRequest: {
    type: "object",
    required: ["payeeId", "amount", "currency"],
    properties: {
      payeeId: { type: "string" },
      amount: { type: "number", minimum: 0.01 },
      currency: { type: "string", enum: ["GBP", "EUR", "USD"] },
      paymentType: { type: "string" }
    },
    additionalProperties: true
  },

  documentRequest: {
    type: "object",
    required: ["documentType", "entityReference", "deliveryChannel"],
    properties: {
      documentType: { type: "string" },
      entityReference: { type: "string" },
      deliveryChannel: { type: "string", enum: ["EMAIL", "POST", "PORTAL"] }
    },
    additionalProperties: true
  }
} as const;

export function validateContract(contractName: keyof typeof contractSchemas, payload: unknown) {
  const schema = contractSchemas[contractName];
  const validate = ajv.compile(schema);
  const valid = validate(payload);

  return {
    contractName,
    valid,
    errors: validate.errors ?? []
  };
}