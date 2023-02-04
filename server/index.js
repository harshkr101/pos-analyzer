import express from "express";
import fs from "fs";
import cors from "cors";
import multer from "multer";
import bodyParser from "body-parser";
import helmet from "helmet";
import path from "path";
import pos from "pos";

const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const ROOT_DIR = path.resolve();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `${ROOT_DIR}/public/uploads`);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const filePath = `${ROOT_DIR}/public/uploads/${file.originalname}`;

    if (!file) {
      return res.status(400).json({ error: "No file was uploaded" });
    }

    const readStream = fs.createReadStream(filePath);

    let data = "";
    readStream.on("data", (chunk) => {
      data += chunk;
    });

    readStream.on("end", () => {
      const lines = data.split("\n");
      let nouns = 0,
        verbs = 0,
        adjectives = 0,
        adverbs = 0,
        totalWords = 0;

      lines.forEach((line) => {
        const words = new pos.Lexer().lex(line);
        totalWords += words.length;
        const taggedWords = new pos.Tagger().tag(words);
        taggedWords.forEach(function (taggedWord) {
          switch (taggedWord[1]) {
            case "NN":
              nouns++;
              break;
            case "VB":
              verbs++;
              break;
            case "JJ":
              adjectives++;
              break;
            case "RB":
              adverbs++;
              break;
          }
        });
      });

      const nounPercentage = (nouns / totalWords) * 100;
      const verbPercentage = (verbs / totalWords) * 100;
      const adjectivePercentage = (adjectives / totalWords) * 100;
      const adverbPercentage = (adverbs / totalWords) * 100;

      res.status(200).json({
        nounPercentage: convertToFixedDecimal(nounPercentage, 3),
        verbPercentage: convertToFixedDecimal(verbPercentage, 3),
        adjectivePercentage: convertToFixedDecimal(adjectivePercentage, 3),
        adverbPercentage: convertToFixedDecimal(adverbPercentage, 3),
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

// convert a float to a fixed decimal point
function convertToFixedDecimal(num, pos) {
  return parseFloat(num).toFixed(pos);
}

const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
