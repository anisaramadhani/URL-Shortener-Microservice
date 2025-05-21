const express = require("express");
const cors = require("cors");
const dns = require("dns");
const bodyParser = require("body-parser");
const urlParser = require("url");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

// Memory store untuk URL shortener (sementara)
let urlDatabase = {};
let counter = 1;

// Home Page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// POST Endpoint untuk membuat short URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  // Cek format URL valid
  try {
    const parsedUrl = urlParser.parse(originalUrl);
    if (!parsedUrl.hostname) {
      return res.json({ error: "invalid url" });
    }

    // Validasi DNS lookup
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: "invalid url" });
      } else {
        const shortUrl = counter++;
        urlDatabase[shortUrl] = originalUrl;
        res.json({
          original_url: originalUrl,
          short_url: shortUrl,
        });
      }
    });
  } catch (error) {
    res.json({ error: "invalid url" });
  }
});

// Redirect dari short URL ke original URL
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for given input" });
  }
});

// Start Server (port ambil dari env atau default 3000)
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
