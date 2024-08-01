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

function isValidUrlFormat(url) {
    const urlPattern = /^(http:\/\/|https:\/\/)(www\.)?[a-zA-Z0-9-]{1,63}\./;
    console.log('received url test result: ', urlPattern.test(url));
    return urlPattern.test(url);
}

app.post('/api/shorturl', function (req, res) {
    const { url } = req.body;
    console.log('url being used: ', url);

    if (!isValidUrlFormat(url)) {
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
