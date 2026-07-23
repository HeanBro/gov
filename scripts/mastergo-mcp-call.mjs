import { spawn } from 'node:child_process';

const [toolName, cliArgs] = process.argv.slice(2);
const rawArgs = process.env.MASTERGO_MCP_ARGS || cliArgs || '{}';
const toolArgs = JSON.parse(rawArgs);
const child = spawn('npx', ['-y', '@mastergo/vibe-mcp', '--url=http://localhost:50678'], {
  shell: true,
  stdio: ['pipe', 'pipe', 'inherit'],
});

let buffer = '';
let nextId = 1;
const pending = new Map();

function send(method, params) {
  const id = nextId++;
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

child.stdout.on('data', chunk => {
  buffer += chunk.toString('utf8');
  for (;;) {
    const index = buffer.indexOf('\n');
    if (index < 0) break;
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (!line.startsWith('{')) continue;
    const message = JSON.parse(line);
    if (message.id == null || !pending.has(message.id)) continue;
    const waiter = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(JSON.stringify(message.error)));
    else waiter.resolve(message.result);
  }
});

try {
  await send('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'codex-local', version: '1.0.0' },
  });
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} })}\n`);
  const result = toolName === '__list__'
    ? await send('tools/list', {})
    : await send('tools/call', { name: toolName, arguments: toolArgs });
  process.stdout.write(JSON.stringify(result, null, 2));
} finally {
  child.kill();
}
