import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function run(command, args, cwd, shell = false) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    cwd,
    env: { ...process.env, GITHUB_PAGES: "true" },
    shell,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npm", ["run", "build"], undefined, true);

const staging = mkdtempSync(join(tmpdir(), "bienestoy-pages-"));
cpSync("dist", staging, { recursive: true });
writeFileSync(join(staging, ".nojekyll"), "");

run("git", ["init", "-b", "gh-pages"], staging);
run("git", ["add", "-A"], staging);
run("git", ["commit", "-m", "Deploy GitHub Pages"], staging);
run(
  "git",
  ["remote", "add", "origin", "https://github.com/martamacfly/Bienestoy.git"],
  staging,
);
run("git", ["push", "-f", "origin", "gh-pages"], staging);

rmSync(staging, { recursive: true, force: true });
