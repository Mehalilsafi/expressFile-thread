const { workerData, parentPort } = require('worker_thread');
const fs = require('fs');
const {filePath,searchText}=workerData

fs.readFile(filePath,'utf8',(err,data)=>{
    if (err) {
        parentPort.postMessage({ filePath, count: 0, error: err.message });
        return;
    }
    const regex = new RegExp(searchText, 'gi');
    const matches = data.match(regex);


    const count = matches ? matches.length : 0;

    parentPort.postMessage({ filePath, count });
})