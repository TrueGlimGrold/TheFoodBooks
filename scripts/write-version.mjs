import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

function getCommit() {
  const envCommit =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CF_PAGES_COMMIT_SHA;
  if (envCommit) return envCommit.slice(0, 12);

  try {
    return execSync("git rev-parse --short=12 HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

const version = {
  name: "the-food-books",
  commit: getCommit(),
  builtAt: new Date().toISOString()
};

mkdirSync("public", { recursive: true });
writeFileSync("public/version.json", `${JSON.stringify(version, null, 2)}\n`, "utf8");

