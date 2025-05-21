const express = require("express");
const cors = require("cors");
const dns = require("dns");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));

let urlDatabase = {};
let counter = 1;

// Home page
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// POST endpoint buat shorten URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  // Validasi URL
  try {
    const parsedUrl = new URL(originalUrl);
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
  } catch (e) {
    res.json({ error: "invalid url" });
  }
});

// Redirect ke original URL
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const originalUrl = urlDatabase[shortUrl];
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: "No short URL found for given input" });
  }
});

// Start server
const listener = app.listen(process.env.PORT || 3001, () => {
  console.log("App is listening on port " + listener.address().port);
});
