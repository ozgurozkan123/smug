import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "do-arjun",
      "Run Arjun to discover hidden HTTP parameters",
      {
        url: z
          .string()
          .url()
          .describe("Target URL to scan for hidden parameters"),
        textFile: z
          .string()
          .optional()
          .describe("Path to file containing multiple URLs"),
        wordlist: z
          .string()
          .optional()
          .describe("Path to custom wordlist file"),
        method: z
          .enum(["GET", "POST", "JSON", "HEADERS"])
          .optional()
          .describe("HTTP method to use for scanning (default: GET)"),
        rateLimit: z
          .number()
          .optional()
          .describe("Maximum requests per second (default: 9999)"),
        chunkSize: z
          .number()
          .optional()
          .describe("Chunk size. The number of parameters to be sent at once"),
      },
      async ({ url, textFile, wordlist, method, rateLimit, chunkSize }) => {
        if (!url && !textFile) {
          return {
            content: [
              {
                type: "text",
                text: "Please provide either a target URL (url) or a file containing URLs (textFile) to build the Arjun command.",
              },
            ],
            isError: true,
          };
        }

        const args: string[] = [];

        if (url) args.push("-u", url);
        if (textFile) args.push("-f", textFile);
        if (wordlist) args.push("-w", wordlist);
        if (method) args.push("-m", method);
        if (rateLimit !== undefined) args.push("--rate-limit", String(rateLimit));
        if (chunkSize !== undefined) args.push("--chunk-size", String(chunkSize));

        const formattedArgs = args
          .map((arg) => (/(\s|\")/.test(arg) ? `\"${arg.replace(/\"/g, "\\\"")}\"` : arg))
          .join(" ");

        const command = `arjun ${formattedArgs}`.trim();

        return {
          content: [
            {
              type: "text",
              text: `Arjun cannot be executed inside this serverless environment.\n\nRun it locally where Arjun is installed (Python/pip or binary) using the generated command:\n\n${command}\n\nNotes:\n- Ensure Arjun is installed and available in your PATH.\n- The arguments mirror the original MCP tool options. Adjust paths and privileges as needed.\n- Network access and subprocess execution are not available on this deployment; only the command string is provided.`,
            },
          ],
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        "do-arjun": {
          description: "Run Arjun to discover hidden HTTP parameters",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
