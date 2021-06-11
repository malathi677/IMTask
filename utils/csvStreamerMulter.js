
const fs = require('fs')

const { parentPort, Worker } = require('worker_threads');


function MyCustomStorage (opts) {
  //this.getDestination = getDestination
}

MyCustomStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  readFileFromStream({ stream: file.stream, cb });
}

MyCustomStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  fs.unlink(file.path, cb)
}


async function readFileFromStream({ stream, cb, path }) {
  const csvParserWorker = new Worker('./workers/csvToJsonParser.js');
  const dbInserterWorker = new Worker('./workers/dbInserter.js');


  csvParserWorker.on('message', (data) => {
    console.log('data from csvParserWorker:');

    dbInserterWorker.postMessage({
      payload: data.result,
    })
  });

  dbInserterWorker.on('message', (data) => {
    console.log('data from dbInserterWorker: ', data);
  });


  let remainder = '';
  let headers = null;
  let totalLines = 0;
  stream
  .on('error', cb)
  .on('data', (row) => {
    
    const lines = (remainder + row).split(/\r?\n/g);

    if(!headers) {
       headers = lines.shift();
       //console.log("🚀 ~ file: csvStreamerMulter.js ~ line 42 ~ .on ~ headers", headers)
    }
  
    remainder = lines.pop();

    totalLines += lines.length;

    csvParserWorker.postMessage({ payload: { headers, lines }, isFinal: false, })
  })
  .on('end', function () {
    console.log('file reading finished.....')
    csvParserWorker.postMessage({payload: { headers, lines: [remainder] }, isFinal: true, })

    cb(null, {
      path: path,
      totalLines,
     })
  })
}

module.exports = function (opts) {
  return new MyCustomStorage(opts)
}