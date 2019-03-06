/*

Represents a compute operation against the Kernel

*/

const Logger = require("./LoggingProvider");
const DefaultKernel = require("./DefaultKernel");
const fs = require("fs");

class KernelOperations {
    constructor() {
        Logger.Info("Starting default kernel");

        this.kernel = new DefaultKernel();
        this.kernel.Initialize();

        // Setup error traps for errors, set flags and fail Promise
    }

    SubmitInputJob(blob) {
        return new Promise(async (resolve, reject) => {
            // 1. Publish input image
            Logger.Info("Writing picture data to file");
            let jobId = Date.now().toString();
            let fileName = `./data/images/${jobId}.png`;
            fs.writeFileSync(fileName, blob);

            // 2. Wait for the results file
            const resultsFilePath = `./data/results/${jobId}.json`;

            // TODO: Failure / max error counts for the checks below!!!

            // 2a. Check that the file exists
            while (!fs.existsSync(resultsFilePath)) {
                Logger.Info("Results file does not exist...");
                await new Promise((resolve) => setTimeout(resolve, 250));
            }

            // 2b. Make sure it has content
            while (fs.statSync(resultsFilePath).size === 0){
                Logger.Info("Results file empty...");
                await new Promise((resolve) => setTimeout(resolve, 250));
            }

            Logger.Info("Found populated results file!");

            // 3. Load result data
            let results = await new Promise((resolve, reject) => {
                fs.readFile(resultsFilePath, (err, data) => {
                    if (err) { reject(err); }
                    const content = data.toString();
                    Logger.Info(`Results file content: ${content}`);
                    resolve(JSON.parse(content));
                });
            });

            // Done
            resolve(results);
        });
    }
}

module.exports = KernelOperations;