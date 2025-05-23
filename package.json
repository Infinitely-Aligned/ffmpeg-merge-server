const express = require('express');
const fetch = require('node-fetch');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/merge', async (req, res) => {
  const { voice_url, bg_url, volume } = req.body;

  if (!voice_url || !bg_url || typeof volume !== 'number') {
    return res.status(400).send('Missing required fields.');
  }

  const voicePath = path.join(__dirname, `${uuidv4()}-voice.mp3`);
  const bgPath = path.join(__dirname, `${uuidv4()}-bg.mp3`);
  const outputPath = path.join(__dirname, `${uuidv4()}-merged.mp3`);

  try {
    const downloadFile = async (url, dest) => {
      const res = await fetch(url);
      const fileStream = fs.createWriteStream(dest);
      await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on('error', reject);
        fileStream.on('finish', resolve);
      });
    };

    await downloadFile(voice_url, voicePath);
    await downloadFile(bg_url, bgPath);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(voicePath)
        .input(bgPath)
        .complexFilter([
          `[1:a]volume=${volume}[bg]; [0:a][bg]amix=inputs=2:duration=first:dropout_transition=2`,
        ])
        .outputOptions('-c:a libmp3lame')
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    const mergedBuffer = fs.readFileSync(outputPath);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(mergedBuffer);
  } catch (err) {
    console.error('Error during merge:', err);
    res.status(500).send('Failed to merge audio.');
  } finally {
    [voicePath, bgPath, outputPath].forEach((file) => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });
  }
});

app.listen(PORT, () => {
  console.log(`Merge server listening on port ${PORT}`);
});
