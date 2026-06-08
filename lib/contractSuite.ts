import { validateContract, ContractName } from "./contracts";
import cases from "./contractSuite.json";

export type ContractExpectation = "PASS" | "FAIL";

export type ContractCase = {
  name: string;
  contract: string;
  expect: ContractExpectation;
  note?: string;
  payload: unknown;
};

export type ContractCaseResult = {
  name: string;
  contract: string;
  expected: ContractExpectation;
  actual: ContractExpectation;
  passed: boolean; // true when actual matched the expectation
  errorCount: number;
  note?: string;
};

export type ContractSuiteResult = {
  total: number;
  passed: number;
  failed: number;
  results: ContractCaseResult[];
};

export const contractCases = cases as ContractCase[];

/**
 * Run every case in the contract suite. A case "passes" when the validation
 * outcome matches its expectation — so a payload that is expected to FAIL and
 * does fail counts as a passing test.
 */
export function runContractSuite(): ContractSuiteResult {
  const results: ContractCaseResult[] = contractCases.map(c => {
    const { valid, errors } = validateContract(c.contract as ContractName, c.payload);
    const actual: ContractExpectation = valid ? "PASS" : "FAIL";
    return {
      name: c.name,
      contract: c.contract,
      expected: c.expect,
      actual,
      passed: actual === c.expect,
      errorCount: errors.length,
      note: c.note
    };
  });

  const passed = results.filter(r => r.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results
  };
}
