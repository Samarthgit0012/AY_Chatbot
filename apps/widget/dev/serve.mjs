// Zero-dependency static server for local widget development — deliberately
// not using a bundler/dev-server package, since this environment has hit a
// Windows Application Control Policy that blocks native binaries some of
// those tools ship (see the vitest note in the repo's dev docs). Plain
// Node's http module has none of that risk.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const devDir = fileURLToPath(new URL(".", import.meta.url));
const widgetDistDir = join(devDir, "..", "dist");
const port = Number(process.env.PORT ?? 8091);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

createServer(async (req, res) => {
  try {
    const url = req.url ?? "/";
    let filePath;
    if (url === "/" || url === "/index.html") {
      filePath = join(devDir, "index.html");
    } else if (url.startsWith("/dist/")) {
      filePath = join(widgetDistDir, url.replace("/dist/", ""));
    } else {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const content = await readFile(filePath);
    res.writeHead(200, { "Content-Type": MIME[extname(filePath)] ?? "application/octet-stream" });
    res.end(content);
  } catch (error) {
    res.writeHead(500);
    res.end(String(error));
  }
}).listen(port, () => {
  console.log(`Widget dev harness: http://localhost:${port}`);
  console.log(`(serving ${widgetDistDir} — run "npm run build --workspace=@revas/widget" first if it's missing)`);
});
