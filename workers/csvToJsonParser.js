const { parentPort, workerData } = require("worker_threads");
const PapaParser = require("papaparse");
parentPort.on("message", (message) => {
  const {
    payload: { headers, lines },
  } = message;

  const input = `${headers}
    ${lines.join('\n')}`;

  const result = PapaParser.parse(input, {
    header: true,
    skipEmptyLines: true,
  });
  parentPort.postMessage({ isFinal: message.isFinal, result: result.data });
});
