const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_req, res) => {
  res.send(`
    <html>
      <body style="font-family: sans-serif; padding: 2rem;">
        <h1>DevOps POC</h1>
        <p>Multi-agent Jenkins pipeline deployed this app.</p>
        <p>Build: ${process.env.BUILD_NUMBER || "local"}</p>
        <p>Environment: ${process.env.APP_ENV || "dev"}</p>
      </body>
    </html>
  `);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
