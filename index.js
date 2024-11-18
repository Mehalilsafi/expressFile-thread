const { error } = require('console');
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');
const app = express();
app.use(express.json());
const directoryPath = './sample-files';


app.get('/', (req, res) => {
    res.send('File Thread Search is running!');
});

app.post('/search', (req, res) => {
    const { searchText } = req.body; 

   
    if (!searchText) {
        return res.status(400).json({ error: 'searchText is required.' });
    }


    if (!fs.existsSync(directoryPath)) {
        return res.status(400).json({ error: 'Directory does not exist.' });
    }

  
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading directory.' });
        }

        let results = [];
        let processedFiles = 0;

       
        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);

            const worker = new Worker('./fileWorker.js', {
                workerData: { filePath, searchText }, 
            });

            worker.on('message', (result) => {
                results.push(result);
                processedFiles++;
                if (processedFiles === files.length) {
                    res.json({ results });
                }
            });

            worker.on('error', (error) => {
                console.error(`Error in worker for ${filePath}:`, error);
                processedFiles++;
                if (processedFiles === files.length) {
                    res.json({ results });
                }
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker for file ${filePath} stopped with exit code ${code}`);
                }
            });
        });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});