export interface SparkMcpConfig {
  vaultPath: string;
  port: number;
  apiKey: string;
}

export function generateMcpServerCode(config: SparkMcpConfig): string {
  return `/**
 * 🐾 anyMD / Library Companion MD - Gemini Spark MCP Server
 * Nyaa~ This is a self-hostable Model Context Protocol server.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

const VAULT_PATH = process.env.ANYMD_VAULT_PATH || "${config.vaultPath.replace(/\\/g, '/')}";

const server = new Server(
  {
    name: "anymd-spark-bridge",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_sidecars",
        description: "List all .companion.md sidecars in the anyMD library vault.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "read_sidecar",
        description: "Read the full Markdown content of a specific .companion.md sidecar.",
        inputSchema: {
          type: "object",
          properties: {
            filename: { type: "string", description: "The filename of the sidecar (e.g. book.companion.md)" }
          },
          required: ["filename"]
        },
      },
      {
        name: "write_sidecar",
        description: "Create or overwrite a .companion.md sidecar file with YAML metadata and Markdown content.",
        inputSchema: {
          type: "object",
          properties: {
            filename: { type: "string", description: "The filename of the sidecar (e.g., book.companion.md)" },
            content: { type: "string", description: "Full markdown file content with frontmatter" }
          },
          required: ["filename", "content"]
        },
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "list_sidecars") {
      const files = fs.readdirSync(VAULT_PATH).filter(f => f.endsWith(".companion.md"));
      return {
        content: [{ type: "text", text: JSON.stringify(files, null, 2) }],
      };
    }

    if (name === "read_sidecar") {
      const target = path.join(VAULT_PATH, path.basename(String(args?.filename)));
      if (!fs.existsSync(target)) {
        return { content: [{ type: "text", text: "Error: File not found." }], isError: true };
      }
      const data = fs.readFileSync(target, "utf-8");
      return { content: [{ type: "text", text: data }] };
    }

    if (name === "write_sidecar") {
      const target = path.join(VAULT_PATH, path.basename(String(args?.filename)));
      fs.writeFileSync(target, String(args?.content), "utf-8");
      return { content: [{ type: "text", text: "Successfully wrote sidecar file!" }] };
    }

    throw new Error("Unknown tool called.");
  } catch (error: any) {
    return {
      content: [{ type: "text", text: \`Error executing tool: \${error.message}\` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("🐾 anyMD Spark MCP Server running on Stdio!");
`;
}
