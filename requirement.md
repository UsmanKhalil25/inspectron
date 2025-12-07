## What is needed:
- we need to screen cast the browser then the crawling starts
- here is the code snippet that worked for me:
```
const { chromium } = require('playwright');
const WebSocket = require('ws');

(async () => {
  // --- Launch Chrome with CDP enabled ---
  const chrome = await chromium.launch({
    headless: false, // can be headless too
    args: [
      "--remote-debugging-port=9222"
    ]
  });

  // Connect to CDP
  const cdp = await chromium.connectOverCDP("http://localhost:9222");

  const context = cdp.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  await page.goto("https://example.com");

  const client = await page.context().newCDPSession(page);

  // Enable Page events
  await client.send("Page.enable");

  // Create WebSocket server for streaming frames to frontend
  const wss = new WebSocket.Server({ port: 9000 });
  console.log("WS running on ws://localhost:9000");

  wss.on("connection", async ws => {
    console.log("Frontend connected");

    // Start screencast
    await client.send("Page.startScreencast", {
      format: "jpeg",
      quality: 60,       // lower = faster
      maxWidth: 1280,
      maxHeight: 720,
    });

    // Receive frames from Chrome
    client.on("Page.screencastFrame", async (frame) => {

      // Send JPEG frame to client
      ws.send(frame.data);

      // MUST ack each frame or Chrome stops sending
      await client.send("Page.screencastFrameAck", {
        sessionId: frame.sessionId
      });
    });

    ws.on("close", () => {
      console.log("Frontend disconnected");
      client.send("Page.stopScreencast").catch(() => {});
    });
  });
})();

```
```
<!DOCTYPE html>
<html>
<body>
  <h2>Live Crawl View</h2>
  <img id="view" />

  <script>
    const ws = new WebSocket("ws://localhost:9000");
    const img = document.getElementById("view");

    ws.onmessage = (ev) => {
      img.src = "data:image/jpeg;base64," + ev.data;
    };
  </script>
</body>
</html>
<!DOCTYPE html>
<html>
<body>
  <h2>Live Crawl View</h2>
  <img id="view" />

  <script>
    const ws = new WebSocket("ws://localhost:9000");
    const img = document.getElementById("view");

    ws.onmessage = (ev) => {
      img.src = "data:image/jpeg;base64," + ev.data;
    };
  </script>
</body>
</html>

```

- note we are using websocket for screencast. I already have an implementation for this but it doesn't work as expected.

- we need to use a post request including the url, then a socket connection establishes, that manages the crawling. we need to ensure that the page changes in the screencast if the url changes
- for the other events such as crawling status , urls and others that can be used from crawl modules we need to send events to the frontend. Make sure we have a scalable way for making this use modular structure


## Coding practices:
- we need to use the shared to house any types or schemas that are used by app and ui
- we need to write simple code. easy to scale. Also make sure we write functions
- don't write comments

