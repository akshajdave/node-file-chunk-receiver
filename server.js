const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw());

app.use(fileUpload());

const fileStorage = {};

app.post('/upload/chunk', (req, res) => {
    
    let chunks = [];

    
    const chunkId = Number(req.query.chunkId);
    const fileName = req.query.fileName;
    const chunksQuantity = Number(req.query.chunksQuantity);
    const fileId = Number(req.query.fileId);
    

    // let chunkId = 1, fileName = '', chunksQuantity = 1, fileId = 1;

    const file = fileStorage[fileId] = fileStorage[fileId] || [];

    // console.log(req.query);

    req.on("data", (part) => {
        
        // console.log(JSON.stringify(part));\
        // console.log(part.toString('utf8'));

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