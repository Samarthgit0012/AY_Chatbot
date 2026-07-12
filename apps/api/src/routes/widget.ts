import { readFile } from "node:fs/promises";
import type { FastifyInstance } from "fastify";

/**
 * Serves the compiled widget.js with an explicit UTF-8 charset. This isn't
 * decorative — a real bug was caught during browser testing where the
 * embedded em dash and icons garbled without an explicit charset on the
 * served content, since a script's text encoding otherwise falls back to
 * whatever the host page (or an intermediary proxy) assumes.
 */
export function registerWidgetRoute(app: FastifyInstance, widgetDistPath: string): void {
  app.get("/widget.js", async (_request, reply) => {
    const content = await readFile(widgetDistPath, "utf8");
    reply.header("Content-Type", "application/javascript; charset=utf-8");
    reply.header("Cache-Control", "public, max-age=300");
    return reply.send(content);
  });
}
