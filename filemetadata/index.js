var express = require('express');
var cors = require('cors');
var multer = require('multer');
require('dotenv').config();

var app = express();

// Configure multer
var upload = multer({ dest: 'uploads/' }); // Files will be uploaded to 'uploads' directory

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Handle file upload
app.post('/upload', upload.single('upfile'), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    res.json({
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
    });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('Your app is listening on port ' + port);
});
