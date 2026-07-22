// Minimal placeholder entrypoint.
//
// This workspace's package.json previously had no "start" script, no "main"
// field, and no root-level index.js/index.ts, which caused Railpack to fail
// with "No start command detected" during the BUILD_IMAGE step.
//
// The pnpm workspace (see pnpm-workspace.yaml) declares packages under
// artifacts/*, lib/*, lib/integrations/*, and scripts, but none of those
// directories are present in this repository yet. Once the real application
// package is added, replace this file (and the "start" script in
// package.json) with the actual entrypoint, e.g.
// "node artifacts/<app>/dist/index.js".
const http = require("http");

const port = process.env.PORT || 3000;

const server = http.createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Project_intel: no application entrypoint configured yet.\n");
});

server.listen(port, () => {
  console.log(`Placeholder server listening on port ${port}`);
});
