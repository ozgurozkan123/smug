import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    // Amass - Advanced subdomain enumeration tool
    // Based on https://github.com/cyproxio/mcp-for-security/tree/main/amass-mcp
    server.tool(
      "amass",
      "Advanced subdomain enumeration and reconnaissance tool",
      {
        subcommand: z.enum(["enum", "intel"]).describe(`Specify the Amass operation mode:
            - intel: Gather intelligence about target domains from various sources
            - enum: Perform subdomain enumeration and network mapping`),
        domain: z.string().optional().describe("Target domain to perform reconnaissance against (e.g., example.com)"),
        intel_whois: z.boolean().optional().describe("Whether to include WHOIS data in intelligence gathering (true/false)"),
        intel_organization: z.string().optional().describe("Organization name to search for during intelligence gathering (e.g., 'Example Corp')"),
        enum_type: z.enum(["active", "passive"]).optional().describe(`Enumeration approach type:
            - active: Includes DNS resolution and potential network interactions with target
            - passive: Only uses information from third-party sources without direct target interaction`),
        enum_brute: z.boolean().optional().describe("Whether to perform brute force subdomain discovery (true/false)"),
        enum_brute_wordlist: z.string().optional().describe("Path to custom wordlist file for brute force operations (e.g., '/path/to/wordlist.txt')")
      },
      async ({ subcommand, domain, intel_whois, intel_organization, enum_type, enum_brute, enum_brute_wordlist }) => {
        const amassArgs: string[] = [subcommand];

        // Handle different subcommands
        if (subcommand === "enum") {
          if (!domain) {
            return {
              content: [{
                type: "text",
                text: "Error: Domain parameter is required for 'enum' subcommand"
              }]
            };
          }

          amassArgs.push("-d", domain);

          // Handle enum type
          if (enum_type === "passive") {
            amassArgs.push("-passive");
          }

          // Handle brute force options
          if (enum_brute === true) {
            amassArgs.push("-brute");
            if (enum_brute_wordlist) {
              amassArgs.push("-w", enum_brute_wordlist);
            }
          }
        } else if (subcommand === "intel") {
          if (!domain && !intel_organization) {
            return {
              content: [{
                type: "text",
                text: "Error: Either domain or organization parameter is required for 'intel' subcommand"
              }]
            };
          }

          if (domain) {
            amassArgs.push("-d", domain);
            if (intel_whois === true) {
              amassArgs.push("-whois");
            }
          }

          if (intel_organization) {
            amassArgs.push("-org", `'${intel_organization}'`);
          }
          
          if (intel_whois === true && !domain) {
            amassArgs.push("-whois");
          }
        }

        const command = `amass ${amassArgs.join(" ")}`;

        return {
          content: [{
            type: "text",
            text: `Run this command locally where Amass is installed:\n\n${command}\n\nNote: Amass is a CLI tool that requires local execution. Install it from https://github.com/owasp-amass/amass`
          }]
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        amass: {
          description: "Advanced subdomain enumeration and reconnaissance tool"
        }
      }
    }
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true
  }
);

// CRITICAL: use named exports for Next.js App Router
export { handler as GET, handler as POST, handler as DELETE };
