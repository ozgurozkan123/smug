import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "do-masscan",
      "Run masscan with specified target. MASSCAN is a fast port scanner. The primary input parameters are the IP addresses/ranges you want to scan, and the port numbers.",
      {
        target: z
          .string()
          .describe(`Target information. Example: 1.1.1.1
            1.1.1.1
            `),
        port: z
          .string()
          .describe(`Target port. Example: 1234
               0-65535
                `),
        masscan_args: z
          .array(z.string())
          .describe(`Additional masscan arguments 
            --max-rate 
            `),
      },
      async ({ target, port, masscan_args }) => {
        const args: string[] = ["-p" + port, target, ...masscan_args];

        const formattedArgs = args
          .map((arg) => (/(\s|\")/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg))
          .join(" ");

        const command = `masscan ${formattedArgs}`;

        return {
          content: [
            {
              type: "text",
              text: `masscan cannot be executed in this serverless environment.\n\nRun it locally where masscan is installed (root/administrator privileges may be required for raw sockets):\n\n${command}\n\nNotes:\n- Ensure the masscan binary is available in your PATH or provide the full path.\n- The command mirrors the original MCP tool arguments. Adjust as needed for your environment.\n- Network access is not available in this serverless deployment; only the command is generated.`,
            },
          ],
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        "do-masscan": {
          description:
            "Run masscan with specified target. MASSCAN is a fast port scanner. The primary input parameters are the IP addresses/ranges you want to scan, and the port numbers.",
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
