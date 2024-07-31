require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
    res.json({ greeting: 'hello API' });
});

const urlMappings = {};
let urlCounter = 1;

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

app.post('/api/shorturl', function (req, res) {
    const { url } = req.body;

    if (!isValidUrl(url)) {
        return res.json({ error: 'invalid url' });
    }

    const shortUrl = urlCounter++;
    urlMappings[shortUrl] = url;

    res.json({
        original_url: url,
        short_url: shortUrl,
    });
});

app.get('/api/shorturl/:shortUrl', function (req, res) {
    const shortUrl = parseInt(req.params.shortUrl, 10);

    if (urlMappings[shortUrl]) {
        res.redirect(urlMappings[shortUrl]);
    } else {
        res.status(404).json({
            error: 'No short URL found for the given input',
        });
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
