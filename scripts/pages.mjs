import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: { ...process.env, GITHUB_PAGES: "true" },
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("npm", ["run", "build"]);
run("npx", [
  "--yes",
  "gh-pages",
  "-d",
  "dist",
  "--dotfiles",
  "-m",
  "Deploy GitHub Pages",
]);
