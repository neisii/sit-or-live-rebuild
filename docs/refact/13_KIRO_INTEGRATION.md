# 13_KIRO_INTEGRATION

## Purpose

Complete Kiro integration including Hooks (automated tasks), MCP servers (external APIs), and Steering (configuration). Everything needed to leverage Kiro's AI capabilities.

## Prerequisites

- Kiro IDE installed
- Understanding of MCP protocol
- Node.js for MCP servers

## Integration Architecture

```
.kiro/
├── hooks/                    # Automated tasks
│   ├── weather-check.json
│   ├── health-monitor.json
│   └── session-start.json
├── mcp/                      # MCP servers
│   ├── weather-server.cjs
│   └── discord-server.cjs
├── settings/
│   └── mcp.json             # MCP configuration
└── steering/
    ├── project-context.md   # Project info for AI
    └── user-config.md       # User preferences
```

## 1. Kiro Hooks

### Hook 1: Weather Check

**File**: `.kiro/hooks/weather-check.json`

```json
{
  "name": "Weather Check",
  "description": "30분마다 날씨를 체크하고 테마를 업데이트합니다",
  "trigger": {
    "type": "timer",
    "interval": 1800000
  },
  "action": {
    "type": "message",
    "content": "현재 날씨를 확인하고 필요하면 테마를 업데이트해주세요. 앱이 실행 중이면 자동으로 업데이트됩니다."
  },
  "enabled": true
}
```

### Hook 2: Health Monitor

**File**: `.kiro/hooks/health-monitor.json`

```json
{
  "name": "Health Monitor",
  "description": "20분마다 눈 건강 알림을 표시합니다",
  "trigger": {
    "type": "timer",
    "interval": 1200000
  },
  "action": {
    "type": "message",
    "content": "20-20-20 규칙을 기억하세요! 20분마다 20초 동안 20피트(6m) 먼 곳을 보세요."
  },
  "enabled": true
}
```

### Hook 3: Session Start

**File**: `.kiro/hooks/session-start.json`

```json
{
  "name": "Session Start",
  "description": "Kiro 세션 시작 시 sit-or-live 앱 실행을 권장합니다",
  "trigger": {
    "type": "session_start"
  },
  "action": {
    "type": "message",
    "content": "sit-or-live 앱을 실행하여 건강 모니터링을 시작하세요!"
  },
  "enabled": true
}
```

## 2. MCP Servers

### MCP Server 1: Weather API

**File**: `.kiro/mcp/weather-server.cjs`

**Complete Implementation**:

```javascript
#!/usr/bin/env node

const https = require('https');

function sendMessage(message) {
  console.log(JSON.stringify(message));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
  
  try {
    const data = await httpGet(url);
    return {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
      timezone: data.timezone
    };
  } catch (error) {
    throw new Error(`Failed to fetch weather: ${error.message}`);
  }
}

async function getLocation() {
  try {
    const data = await httpGet('https://ipapi.co/json/');
    return {
      city: data.city,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude
    };
  } catch (error) {
    throw new Error(`Failed to fetch location: ${error.message}`);
  }
}

const SERVER_CAPABILITIES = {
  protocolVersion: '2024-11-05',
  serverInfo: {
    name: 'weather-api',
    version: '1.0.0'
  },
  capabilities: {
    tools: {
      get_weather: {
        description: 'Get current weather for a location',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: { type: 'number', description: 'Latitude' },
            longitude: { type: 'number', description: 'Longitude' }
          },
          required: ['latitude', 'longitude']
        }
      },
      get_location: {
        description: 'Get current location based on IP',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    }
  }
};

async function handleMessage(message) {
  if (message.method === 'initialize') {
    sendMessage({
      jsonrpc: '2.0',
      id: message.id,
      result: SERVER_CAPABILITIES
    });
    return;
  }
  
  if (message.method === 'tools/list') {
    sendMessage({
      jsonrpc: '2.0',
      id: message.id,
      result: {
        tools: [
          {
            name: 'get_weather',
            description: 'Get current weather for a location',
            inputSchema: {
              type: 'object',
              properties: {
                latitude: { type: 'number', description: 'Latitude' },
                longitude: { type: 'number', description: 'Longitude' }
              },
              required: ['latitude', 'longitude']
            }
          },
          {
            name: 'get_location',
            description: 'Get current location based on IP',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      }
    });
    return;
  }
  
  if (message.method === 'resources/list') {
    sendMessage({
      jsonrpc: '2.0',
      id: message.id,
      result: {
        resources: []
      }
    });
    return;
  }
  
  if (message.method === 'tools/call') {
    const { name, arguments: args } = message.params;
    
    try {
      let result;
      
      if (name === 'get_weather') {
        result = await getWeather(args.latitude, args.longitude);
      } else if (name === 'get_location') {
        result = await getLocation();
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
      
      sendMessage({
        jsonrpc: '2.0',
        id: message.id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        }
      });
    } catch (error) {
      sendMessage({
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32000,
          message: error.message
        }
      });
    }
  }
}

function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    if (!line.trim()) return;
    
    try {
      const message = JSON.parse(line);
      handleMessage(message);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });
}

main();
```

### MCP Server 2: Discord Webhook

**File**: `.kiro/mcp/discord-server.cjs`

```javascript
#!/usr/bin/env node

const https = require('https');

function sendMessage(message) {
  console.log(JSON.stringify(message));
}

async function sendNotification(webhookUrl, message, title, description, color) {
  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);
    
    const payload = JSON.stringify({
      content: message,
      embeds: [{
        title: title || undefined,
        description: description || undefined,
        color: color || 0x5865F2
      }]
    });
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true });
        } else {
          reject(new Error(`Discord API error: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const SERVER_CAPABILITIES = {
  protocolVersion: '2024-11-05',
  serverInfo: {
    name: 'discord-webhook',
    version: '1.0.0'
  },
  capabilities: {
    tools: {
      send_notification: {
        description: 'Send a notification to Discord',
        inputSchema: {
          type: 'object',
          properties: {
            webhook_url: { type: 'string', description: 'Discord webhook URL' },
            message: { type: 'string', description: 'Message content' },
            title: { type: 'string', description: 'Embed title (optional)' },
            description: { type: 'string', description: 'Embed description (optional)' },
            color: { type: 'number', description: 'Embed color (optional)' }
          },
          required: ['webhook_url', 'message']
        }
      }
    }
  }
};

async function handleMessage(message) {
  if (message.method === 'initialize') {
    sendMessage({
      jsonrpc: '2.0',
      id: message.id,
      result: SERVER_CAPABILITIES
    });
    return;
  }
  
  if (message.method === 'tools/list') {
    sendMessage({
      jsonrpc: '2.0',
      id: message.id,
      result: {
        tools: [{
          name: 'send_notification',
          description: 'Send a notification to Discord',
          inputSchema: {
            type: 'object',
            properties: {
              webhook_url: { type: 'string' },
              message: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              color: { type: 'number' }
            },
            required: ['webhook_url', 'message']
          }
        }]
      }
    });
    return;
  }
  
  if (message.method === 'resources/list') {
    sendMessage({
      jsonrpc: '2.0',
      id: message.id,
      result: { resources: [] }
    });
    return;
  }
  
  if (message.method === 'tools/call') {
    const { name, arguments: args } = message.params;
    
    try {
      if (name === 'send_notification') {
        const result = await sendNotification(
          args.webhook_url,
          args.message,
          args.title,
          args.description,
          args.color
        );
        
        sendMessage({
          jsonrpc: '2.0',
          id: message.id,
          result: {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          }
        });
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      sendMessage({
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32000,
          message: error.message
        }
      });
    }
  }
}

function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    if (!line.trim()) return;
    
    try {
      const message = JSON.parse(line);
      handleMessage(message);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  });
}

main();
```

## 3. MCP Configuration

**File**: `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "weather-api": {
      "command": "node",
      "args": [".kiro/mcp/weather-server.cjs"],
      "cwd": "/absolute/path/to/sit-or-live",
      "env": {},
      "disabled": false,
      "autoApprove": ["get_weather", "get_location"]
    },
    "discord-webhook": {
      "command": "node",
      "args": [".kiro/mcp/discord-server.cjs"],
      "cwd": "/absolute/path/to/sit-or-live",
      "env": {
        "DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/your-webhook-url"
      },
      "disabled": false,
      "autoApprove": ["send_notification"]
    }
  }
}
```

**Note**: Replace `/absolute/path/to/sit-or-live` with actual project path.

## 4. Steering Files

### Project Context

**File**: `.kiro/steering/project-context.md`

```markdown
# sit-or-live Project Context

## Project Overview
- **Name**: sit-or-live
- **Purpose**: Weather-based theme changer + Developer health manager
- **Tech Stack**: Tauri (Rust + React), Supabase, Next.js

## Key Features
1. Weather-based automatic theme switching (6 themes)
2. Health monitoring (idle time, eye health)
3. IDE/Terminal theme integration (7 platforms)
4. Global statistics dashboard (Next.js + Supabase)
5. Discord notifications

## Development Guidelines
- Use TypeScript for all frontend code
- Follow Rust best practices for backend
- Test all features before committing
- Update documentation when adding features

## Useful Commands
- `npm run tauri:dev` - Run development server
- `npm run tauri:build` - Build production app
- `npm run generate-themes` - Regenerate theme files
- `npm test` - Run tests
```

### User Configuration

**File**: `.kiro/steering/user-config.md`

```markdown
# User Configuration

## Preferences
- **Language**: English (EN) or Korean (KO)
- **Theme Mode**: Automatic (weather-based)
- **Health Monitoring**: Enabled
- **Discord Notifications**: Optional

## Customization
- Zombie warning threshold: 30 minutes (adjustable)
- Eye break interval: 20 minutes (20-20-20 rule)
- IDE: VS Code or Kiro
- Terminal: iTerm2, Warp, Kitty, Hyper, or macOS Terminal

## Privacy
- All personal data stored locally only
- Anonymous aggregated statistics sent to Supabase
- No user tracking or identification
```

## Implementation Steps

### 1. Create Directory Structure

```bash
mkdir -p .kiro/hooks
mkdir -p .kiro/mcp
mkdir -p .kiro/settings
mkdir -p .kiro/steering
```

### 2. Create Hook Files

```bash
# Weather check hook
cat > .kiro/hooks/weather-check.json << 'EOF'
[paste JSON from above]
EOF

# Health monitor hook
cat > .kiro/hooks/health-monitor.json << 'EOF'
[paste JSON from above]
EOF

# Session start hook
cat > .kiro/hooks/session-start.json << 'EOF'
[paste JSON from above]
EOF
```

### 3. Create MCP Servers

```bash
# Weather server
cat > .kiro/mcp/weather-server.cjs << 'EOF'
[paste complete script from above]
EOF

chmod +x .kiro/mcp/weather-server.cjs

# Discord server
cat > .kiro/mcp/discord-server.cjs << 'EOF'
[paste complete script from above]
EOF

chmod +x .kiro/mcp/discord-server.cjs
```

### 4. Configure MCP

```bash
# Create MCP config
cat > .kiro/settings/mcp.json << 'EOF'
[paste JSON from above, update paths]
EOF
```

### 5. Create Steering Files

```bash
# Project context
cat > .kiro/steering/project-context.md << 'EOF'
[paste markdown from above]
EOF

# User config
cat > .kiro/steering/user-config.md << 'EOF'
[paste markdown from above]
EOF
```

## Verification

### Test MCP Servers

```bash
# Test weather server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node .kiro/mcp/weather-server.cjs

# Expected: JSON response with tools list

# Test Discord server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node .kiro/mcp/discord-server.cjs

# Expected: JSON response with send_notification tool
```

### Test in Kiro IDE

1. Open Kiro IDE
2. Open sit-or-live project
3. Check MCP servers are connected:
   - Open Command Palette
   - Search "MCP"
   - Verify weather-api and discord-webhook are listed
4. Test weather tool:
   - Ask Kiro: "What's the weather in Seoul?"
   - Should use get_weather tool
5. Check hooks are active:
   - Wait 30 minutes
   - Should see weather check reminder

## Troubleshooting

### Issue: MCP servers not connecting

**Solution**:
1. Check Node.js is installed: `node --version`
2. Verify paths in mcp.json are absolute
3. Check file permissions: `chmod +x .kiro/mcp/*.cjs`
4. Restart Kiro IDE

### Issue: Hooks not triggering

**Solution**:
1. Check hooks are enabled in JSON files
2. Verify Kiro IDE is running
3. Check hook syntax is valid JSON

### Issue: Tools not auto-approved

**Solution**:
1. Add tool names to `autoApprove` array in mcp.json
2. Restart MCP servers from Kiro

## Next Steps

Proceed to `14_WEB_DASHBOARD.md` for Next.js dashboard implementation.
