import { readFileSync } from "node:fs";

// Minimal sanity checks to keep early development honest.
const version = JSON.parse(readFileSync("public/version.json", "utf8"));
if (!version?.builtAt) throw new Error("version.json missing builtAt");

console.log("ok smoke-test", { commit: version.commit, builtAt: version.builtAt });

