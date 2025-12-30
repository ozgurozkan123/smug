import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    // Arjun
    server.tool(
      "do-arjun",
      "Run Arjun to discover hidden HTTP parameters",
      {
        url: z.string().url().describe("Target URL to scan for hidden parameters"),
        textFile: z.string().optional().describe("Path to file containing multiple URLs"),
        wordlist: z.string().optional().describe("Path to custom wordlist"),
        method: z.enum(["GET", "POST", "JSON", "HEADERS"]).optional().describe("HTTP method"),
        rateLimit: z.number().optional().describe("Requests per second"),
        chunkSize: z.number().optional().describe("Chunk size for parameters"),
      },
      async ({ url, textFile, wordlist, method, rateLimit, chunkSize }) => {
        const args: string[] = [];
        if (url) args.push("-u", url);
        if (textFile) args.push("-f", textFile);
        if (wordlist) args.push("-w", wordlist);
        if (method) args.push("-m", method);
        if (rateLimit !== undefined) args.push("--rate-limit", String(rateLimit));
        if (chunkSize !== undefined) args.push("--chunk-size", String(chunkSize));
        const command = `arjun ${args.join(" ")}`.trim();
        return {
          content: [{
            type: "text",
            text: `Run this locally where Arjun is installed:\n${command}`,
          }],
        };
      }
    );

    // Amass
    server.tool(
      "do-amass",
      "Enumerate subdomains with Amass",
      {
        domain: z.string().describe("Target domain"),
        passive: z.boolean().optional().describe("Use passive mode only"),
        output: z.string().optional().describe("Output file path"),
      },
      async ({ domain, passive, output }) => {
        const args = ["enum", "-d", domain];
        if (passive) args.push("-passive");
        if (output) args.push("-o", output);
        const command = `amass ${args.join(" ")}`;
        return { content: [{ type: "text", text: `Run locally:\n${command}` }] };
      }
    );

    // Assetfinder
    server.tool(
      "do-assetfinder",
      "Find subdomains with assetfinder",
      { domain: z.string().describe("Target domain") },
      async ({ domain }) => ({
        content: [{ type: "text", text: `Run locally:\nassetfinder ${domain}` }],
      })
    );

    // httpx
    server.tool(
      "do-httpx",
      "Probe hosts with httpx",
      {
        targets: z.array(z.string()).nonempty().describe("List of hosts/domains"),
        ports: z.string().optional().describe("Comma separated ports (e.g., 80,443,8080)"),
      },
      async ({ targets, ports }) => {
        const args: string[] = ["-u", targets.join(","), "-silent"];
        if (ports) args.push("-p", ports);
        const command = `httpx ${args.join(" ")}`;
        return { content: [{ type: "text", text: `Run locally:\n${command}` }] };
      }
    );

    // FFUF
    server.tool(
      "do-ffuf",
      "Fuzz paths with ffuf",
      {
        url: z.string().describe("Target URL, use FUZZ keyword"),
        wordlist: z.string().describe("Path to wordlist"),
        extensions: z.array(z.string()).optional().describe("File extensions (e.g., php,html)"),
      },
      async ({ url, wordlist, extensions }) => {
        const args = ["-u", url, "-w", wordlist];
        if (extensions && extensions.length > 0) args.push("-e", extensions.join(","));
        const command = `ffuf ${args.join(" ")}`;
        return { content: [{ type: "text", text: `Run locally:\n${command}` }] };
      }
    );

    // SQLMap
    server.tool(
      "do-sqlmap",
      "SQL injection testing with sqlmap",
      {
        url: z.string().describe("Target URL with parameters"),
        dump: z.boolean().optional().describe("Dump database contents"),
      },
      async ({ url, dump }) => {
        const args = ["-u", url];
        if (dump) args.push("--dump");
        const command = `sqlmap ${args.join(" ")}`;
        return { content: [{ type: "text", text: `Run locally:\n${command}` }] };
      }
    );

    // Nmap
    server.tool(
      "do-nmap",
      "Run nmap network scanner",
      {
        target: z.string().describe("Target host or network"),
        flags: z.string().optional().describe("Additional flags, default -sV"),
      },
      async ({ target, flags }) => {
        const command = `nmap ${flags ?? "-sV"} ${target}`.trim();
        return { content: [{ type: "text", text: `Run locally:\n${command}` }] };
      }
    );

    // Nuclei
    server.tool(
      "do-nuclei",
      "Run nuclei vulnerability scanner",
      {
        target: z.string().describe("Target URL or host"),
        templates: z.string().optional().describe("Path to templates or directory"),
      },
      async ({ target, templates }) => {
        const args = ["-u", target];
        if (templates) args.push("-t", templates);
        const command = `nuclei ${args.join(" ")}`;
        return { content: [{ type: "text", text: `Run locally:\n${command}` }] };
      }
    );

    // Waybackurls
    server.tool(
      "do-waybackurls",
      "Fetch historical URLs with waybackurls",
      { domain: z.string().describe("Target domain") },
      async ({ domain }) => ({
        content: [{ type: "text", text: `Run locally:\nwaybackurls ${domain}` }],
      })
    );

    // Masscan
    server.tool(
      "do-masscan",
      "Fast port scan with masscan",
      {
        target: z.string().describe("Target IP/CIDR"),
        ports: z.string().describe("Ports e.g., 1-65535 or 80,443"),
        rate: z.number().optional().describe("Packets per second")
      },
      async ({ target, ports, rate }) => {
        const args = ["-p", ports, target];
        if (rate) args.push("--rate", String(rate));
        const command = `masscan ${args.join(" ")}`;
        return { content: [{ type: "text", text: `Run locally with root privileges:\n${command}` }] };
      }
    );

    // Katana
    server.tool(
      "do-katana",
      "Crawl with katana",
      {
        url: z.string().describe("Target URL"),
        depth: z.number().optional().describe("Crawl depth"),
      },
      async ({ url, depth }) => {
        const args = ["-u", url];
        if (depth !== undefined) args.push("-d", String(depth));
        const command = `katana ${args.join(" ")}`;
        return { content: [{ type: "text", text: `Run locally:\n${command}` }] };
      }
    );

    // shuffledns
    server.tool(
      "do-shuffledns",
      "DNS brute force with shuffledns",
      {
        domain: z.string().describe("Target domain"),
        wordlist: z.string().optional().describe("Path to wordlist"),
        resolvers: z.string().optional().describe("Path to resolvers file"),
      },
      async ({ domain, wordlist, resolvers }) => {
        const args = ["-d", domain];
        if (wordlist) args.push("-w", wordlist);
        if (resolvers) args.push("-r", resolvers);
        const command = `shuffledns ${args.join(" ")}`;
        return { content: [{ type: "text", text: `Run locally:\n${command}` }] };
      }
    );

    // SSLScan
    server.tool(
      "do-sslscan",
      "Analyze SSL/TLS config with sslscan",
      { target: z.string().describe("Host:port, e.g., example.com:443") },
      async ({ target }) => ({
        content: [{ type: "text", text: `Run locally:\nsslscan ${target}` }],
      })
    );

    // Gowitness
    server.tool(
      "do-gowitness",
      "Screenshot web pages with gowitness",
      { url: z.string().describe("Target URL") },
      async ({ url }) => ({
        content: [{ type: "text", text: `Run locally:\ngowitness scan single --url ${url}` }],
      })
    );

    // crt.sh lookup
    server.tool(
      "do-crtsh",
      "Query crt.sh for subdomains",
      { domain: z.string().describe("Target domain") },
      async ({ domain }) => ({
        content: [{
          type: "text",
          text: `Use curl to query crt.sh:\ncurl "https://crt.sh/?q=%25.${domain}&output=json"`
        }],
      })
    );

    // WPScan
    server.tool(
      "do-wpscan",
      "Scan WordPress sites with WPScan",
      {
        url: z.string().describe("Target site URL"),
        apiToken: z.string().optional().describe("WPScan API token for vulnerability data"),
      },
      async ({ url, apiToken }) => {
        const args = ["--url", url];
        if (apiToken) args.push("--api-token", apiToken);
        const command = `wpscan ${args.join(" ")}`;
        return { content: [{ type: "text", text: `Run locally:\n${command}` }] };
      }
    );

  },
  {
    capabilities: {
      tools: {
        "do-arjun": { description: "Run Arjun to discover hidden HTTP parameters" },
        "do-amass": { description: "Enumerate subdomains with Amass" },
        "do-assetfinder": { description: "Find subdomains with assetfinder" },
        "do-httpx": { description: "Probe hosts with httpx" },
        "do-ffuf": { description: "Fuzz paths with ffuf" },
        "do-sqlmap": { description: "SQL injection testing with sqlmap" },
        "do-nmap": { description: "Run nmap network scanner" },
        "do-nuclei": { description: "Run nuclei vulnerability scanner" },
        "do-waybackurls": { description: "Fetch historical URLs with waybackurls" },
        "do-masscan": { description: "Fast port scan with masscan" },
        "do-katana": { description: "Crawl with katana" },
        "do-shuffledns": { description: "DNS brute force with shuffledns" },
        "do-sslscan": { description: "Analyze SSL/TLS config with sslscan" },
        "do-gowitness": { description: "Screenshot web pages with gowitness" },
        "do-crtsh": { description: "Query crt.sh for subdomains" },
        "do-wpscan": { description: "Scan WordPress sites with WPScan" },
      },
    },
  } as any,
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
