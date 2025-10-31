// Minimal express server to expose a /status endpoint for signal_gen
const express = require('express');
const app = express();

app.get('/status', (req, res) => {
  res.json({ app: 'signal_gen', status: 'ok' });
});

const port = process.env.PORT || 8200;
if (require.main === module) {
  app.listen(port, () => console.log(`signal_gen server listening on ${port}`));
}

module.exports = app;
