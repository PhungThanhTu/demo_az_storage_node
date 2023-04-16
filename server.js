const { BlobServiceClient } = require("@azure/storage-blob");
const path = require('path');
const express = require('express');
const http = require('http');
const multer = require("multer");
const cors = require('cors');
const { buffer } = require("stream/consumers");
var app = express();


// CONSTANT
const containerName = "democontainer";
const connectionString = "UseDevelopmentStorage=true;";
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

app.use(cors());

app.post('/upload', upload.single('file'), async (req, res) => {
    const blobName = req.file.originalname;
    const fileContent = req.file.buffer;

    const containerClient = blobServiceClient.getContainerClient(containerName);

    await containerClient.createIfNotExists();
   
    const blobClient = containerClient.getBlockBlobClient(blobName);
    const response = await blobClient.upload(fileContent, fileContent.length);


    res.send(`success ${blobName} and ${response.requestId}`);
});


app.get('/:blobName', async (req, res) => {

    const blobName = req.params.blobName;

    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobClient = containerClient.getBlockBlobClient(blobName);

    try {
        const blobStream = await blobClient.download();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Security-Policy', "frame-ancestors *");
        
        blobStream.readableStreamBody.pipe(res);
    }
    catch (err)
    {

        res.status(500).send(`${err}`)
    }

})

app.set('port', 1111);

var server = http.createServer(app);

server.listen(1111);

server.on('error', () => console.log('server listen failed'));
server.on('listening', () => console.log('server is listening at port 1111'));