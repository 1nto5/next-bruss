- for each new conversation: run `bun run dev`, retrieve the target address from bash (e.g. http://localhost:3000), and use MCP's chrome-devtools `navigate_page` to open it.
- always respond in English; if a message is in Polish, also provide its English translation

## Testing

- During testing of my application, use the chrome-devtools MCP to visit each page and analyze the correct display of elements and their functionality.
- If login is required, use the test user according to the environment variables.
