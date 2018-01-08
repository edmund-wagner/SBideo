var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar'); //watcher
var child_process = require('child_process');
var argv = require('minimist')(process.argv.slice(2));

var fileArray = [];
var isTranscoding = false;
var incomingFolder = argv._[0];
var dataFolder = argv._[1];
var counter = 1;

var watcher = chokidar.watch(incomingFolder, {
    ignored: ['/[\/\\]\./', '**/empty', '**/*.encoded'],
    persistent: true,
    usePolling: true, // set to true if files are on an network share
    interval: 5000, // polling interval
    awaitWriteFinish: true // wait until write operation of file is finished before start encoding
});

watcher.on('add', function (filePath) {
    fileArray.push(filePath);
    console.log('New file found, added to queue:', filePath);

    if (isTranscoding == false) {
        transcodeAndMoveNextFile();
    }
});

function transcodeAndMoveNextFile() {
    isTranscoding = true;
    
    // get next file
    var filePath = fileArray.shift();
    console.log('Start transcoding of file:', filePath);
    
    var title = path.basename(filePath, path.extname(filePath));
    var outputPath = dataFolder + '/new/' + title + '-' + counter;

    child_process.exec(`mkdir -p "${outputPath}"; ffmpeg -i "${filePath}" -f mp4 -vcodec libx264 -preset medium -profile:v main -acodec aac -movflags faststart -vf format=yuv420p "${outputPath}/video.mp4"; mv "${filePath}" "${filePath}.encoded";`, function (error, stdout, stderr) {
        var metaJson = {
            title: title,
            description: '',
            tags: [],
            people: []
        };
        var json = JSON.stringify(metaJson, null, 4);
        fs.writeFile(outputPath + '/meta.json', json, function () {});

        counter++;
    
        // output error
        if (error == null) {
            console.log('finished transcoding of file:', filePath);
        } else {
            console.log('errors while transcoding:', error, stdout, stderr);
        }
        
        // transcode next file
        if (fileArray.length) {
            transcodeAndMoveNextFile();
        } else {
            isTranscoding = false;
        }
    });

}

console.log('started, waiting for new files to transcode...');