import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    server.tool(
      "do-nuclei",
      "Execute Nuclei, an advanced vulnerability scanner that uses YAML-based templates to detect security vulnerabilities, misconfigurations, and exposures in web applications and infrastructure. Nuclei offers fast scanning with a vast template library covering various security checks.",
      {
        url: z.string().url().describe("Target URL to run nuclei"),
        tags: z.array(z.string()).optional().describe("Tags to run nuclei; for multiple choices use comma separation"),
      },
      async ({ url, tags }) => {
        const nucleiArgs: string[] = ["-u", url, "-silent"];

        if (tags && tags.length > 0) {
          nucleiArgs.push("-tags", tags.join(","));
        }

        const formattedArgs = nucleiArgs
          .map((arg) => (arg.includes(" ") ? `"${arg.replace(/"/g, '\\"')}"` : arg))
          .join(" ");

        const command = `nuclei ${formattedArgs}`;

        return {
          content: [
            {
              type: "text",
              text: `Nuclei cannot be executed in this serverless environment.\n\nRun it locally where nuclei is installed:\n\n${command}\n\nNotes:\n- Ensure the nuclei binary is available in your PATH or provide the full path.\n- Templates and configuration must exist in your environment.\n- Tags are passed directly as provided.`,
            },
          ],
        };
      }
    );

    server.tool(
      "get-nuclei-tags",
      "Get Nuclei Tags",
      {},
      async () => {
        try {
          const response = await fetch(
            "https://raw.githubusercontent.com/projectdiscovery/nuclei-templates/refs/heads/main/TEMPLATES-STATS.json"
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          const tags = Array.isArray(data?.tags)
            ? data.tags.map((tag: { name?: string }) => tag.name).filter(Boolean)
            : [];

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(tags, null, 2),
              },
            ],
          };
        } catch (error: any) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to fetch nuclei tags: ${error?.message ?? error}`,
              },
            ],
          };
        }
      }
    );
  },
  {
    capabilities: {
      tools: {
        "do-nuclei": {
          description:
            "Execute Nuclei, an advanced vulnerability scanner that uses YAML-based templates to detect security vulnerabilities, misconfigurations, and exposures in web applications and infrastructure. Nuclei offers fast scanning with a vast template library covering various security checks.",
        },
        "get-nuclei-tags": {
          description: "Get Nuclei Tags",
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
