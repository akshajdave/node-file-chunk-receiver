const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

const fileStorage = {};

app.post('/upload/chunk', (req, res) => {
    
    let chunks = [];

    const chunkId = Number(req.headers["x-chunk-id"]);
    const fileName = req.headers["x-content-name"];
    const chunksQuantity = Number(req.headers["x-chunks-quantity"]);
    const fileId = Number(req.headers["x-file-id"]);

    const file = fileStorage[fileId] = fileStorage[fileId] || [];

    req.on("data", (part) => {
        chunks.push(part);
        // console.log(part.length);
    }).on("end", () => {

        const completeChunk= Buffer.concat(chunks);

        // console.log(fileStorage);
        file[chunkId] = completeChunk;

       
        if(chunksQuantity === chunkId + 1) {
            
            const completeFile = Buffer.concat(file);
            // console.log('GO ' + completeFile.length);
            const fileStream = fs.createWriteStream(__dirname + '/uploads/' + fileName);
            fileStream.write(completeFile);
            fileStream.end();
            delete fileStorage[fileId];
        }
        
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({status: 200}));
        res.end();

    });


});

app.get('/', (req, res) => {
    console.log(req.body);
    res.status(200).send('App is up');
});

app.listen(5000, () => console.log('Server is running on Port 5000'));