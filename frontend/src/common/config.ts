const urlHost = location.host.split(":")[0];
const port = 3000;
const host = "minesweeper.snowbellstudio.com";

export let wsUrl = `wss://${host}:${port}`;
export let sokcetioUrl = `https://${host}:${port}`;

// for local dev
if (urlHost === "localhost" || urlHost === "127.0.0.1") {
  wsUrl = `ws://localhost:${port}`;
  sokcetioUrl = `http://localhost:${port}`;
}
