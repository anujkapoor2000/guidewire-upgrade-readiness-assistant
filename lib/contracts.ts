import Ajv, { AnySchema } from "ajv";
import schemas from "./contractSchemas.json";

const ajv = new Ajv({ allErrors: true });

// Single source of truth — shared with the CLI suite (scripts/run-contract-tests.js)
// via lib/contractSchemas.json.
export const contractSchemas = schemas;

export type ContractName = keyof typeof contractSchemas;

export function validateContract(contractName: ContractName, payload: unknown) {
  const schema = contractSchemas[contractName] as AnySchema;
  const validate = ajv.compile(schema);
  const valid = validate(payload);

  return {
    contractName,
    valid,
    errors: validate.errors ?? []
  };
}
