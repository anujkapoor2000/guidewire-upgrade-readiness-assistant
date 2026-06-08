#!/usr/bin/env node
/*
 * Guidewire integration contract suite (CLI).
 *
 * Validates the shared example payloads in lib/contractSuite.json against the
 * JSON Schema contracts in lib/contractSchemas.json — the same definitions the
 * web app uses. A case "passes" when the validation outcome matches its
 * expectation (an expected-FAIL payload that does fail is a passing test).
 *
 * Run with: npm run test:contracts
 * Exits non-zero if any case does not match its expectation.
 */

const AjvModule = require("ajv");
const Ajv = AjvModule.default || AjvModule;

const schemas = require("../lib/contractSchemas.json");
const cases = require("../lib/contractSuite.json");

const ajv = new Ajv({ allErrors: true });

// Compile each contract schema once.
const validators = {};
for (const [name, schema] of Object.entries(schemas)) {
  validators[name] = ajv.compile(schema);
}

let failures = 0;

console.log("\nGuidewire integration contract suite");
console.log("=".repeat(48) + "\n");

for (const testCase of cases) {
  const validate = validators[testCase.contract];
  if (!validate) {
    console.log(`✗  ${testCase.name}  [unknown contract: ${testCase.contract}]`);
    failures++;
    continue;
  }

  const valid = validate(testCase.payload);
  const actual = valid ? "PASS" : "FAIL";
  const ok = actual === testCase.expect;
  if (!ok) failures++;

  console.log(
    `${ok ? "✓" : "✗"}  ${testCase.name}\n` +
      `   contract=${testCase.contract}  expected=${testCase.expect}  actual=${actual}`
  );

  if (!valid) {
    const messages = (validate.errors || []).map(
      e => `${e.instancePath || "(root)"} ${e.message}`
    );
    console.log(`   errors: ${messages.join("; ")}`);
  }
  console.log("");
}

const total = cases.length;
const passed = total - failures;
console.log("=".repeat(48));
console.log(`${passed}/${total} checks passed.\n`);

process.exit(failures > 0 ? 1 : 0);
