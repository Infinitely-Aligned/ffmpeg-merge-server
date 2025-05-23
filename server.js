const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/merge", async (req, res) => {
  const { voice_url, bg_url, volume } = req.body;
  // merging logic goes here
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
