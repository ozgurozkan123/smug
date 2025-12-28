import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "do-smuggler",
      "Run Smuggler to detect HTTP Request Smuggling vulnerabilities",
      {
        url: z.string().url().describe("Target URL to detect HTTP Request Smuggling"),
        smuggler_args: z
          .array(z.string())
          .optional()
          .describe(
            "Additional smuggler.py arguments (passed as-is, e.g., -m GET, -v example.com, -l, -c config.txt, -x, -t 10, -verify quick)"
          ),
      },
      async ({ url, smuggler_args = [] }) => {
        const args = ["-u", url, ...smuggler_args];
        const formattedArgs = args
          .map((arg) => (arg.includes(" ") ? `\"${arg.replace(/\"/g, '\\\"')}\"` : arg))
          .join(" ");

        const command = `python smuggler.py ${formattedArgs}`;

        return {
          content: [
            {
              type: "text",
              text: `Smuggler cannot be executed in this serverless environment.\n\nRun it locally or in your own environment with:\n\n${command}\n\nNotes:\n- Provide the correct python interpreter and smuggler.py path.\n- Arguments are passed as provided.\n- Review output locally for findings.`,
            },
          ],
        };
      },
    );
  },
  {
    capabilities: {
      tools: {
        "do-smuggler": {
          description: "Run Smuggler to detect HTTP Request Smuggling vulnerabilities",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  },
);

export { handler as GET, handler as POST, handler as DELETE, handler as HEAD, handler as OPTIONS };
