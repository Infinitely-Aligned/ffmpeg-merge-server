const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());

app.post("/", upload.none(), async (req, res) => {
  const { voice_url, bg_url, volume = 0.4 } = req.body;

  const voicePath = `downloads/voice.mp3`;
  const bgPath = `downloads/bg.mp3`;
  const outputPath = `merged/merged_${Date.now()}.mp3`;

  const download = (url, dest) =>
    new Promise((resolve, reject) => {
      const file = fs.createWriteStream(dest);
      require("https").get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      }).on("error", reject);
    });

  try {
    fs.mkdirSync("downloads", { recursive: true });
    fs.mkdirSync("merged", { recursive: true });

    await download(voice_url, voicePath);
    await download(bg_url, bgPath);

    ffmpeg()
      .input(voicePath)
      .input(bgPath)
      .complexFilter([`[1:a]volume=${volume}[bg]`, `[0:a][bg]amix=inputs=2:duration=first:dropout_transition=0`])
      .on("end", () => {
        res.sendFile(path.resolve(outputPath));
      })
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        res.status(500).send("Merging failed");
      })
      .save(outputPath);
  } catch (err) {
    console.error("Download or processing error:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => console.log("FFmpeg merge server running on port 3000"));