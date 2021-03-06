/*

Represents a compute operation against the Kernel

*/

const logger = require("./LoggingProvider");
const defaultKernel = require("./DefaultKernel");
const fs = require("fs");

const MAX_CHECKS = 20;
const POLL_INTERVAL_MS = 500;
const RES_LOG_STARTING_KERNEL = "Starting default kernel";
const RES_LOG_RESTARTING_KERNEL = "Restarting kernel process";
const RES_LOG_WRITING_IMG_TO_FILE = "Writing picture data to file";
const RES_LOG_RESULTS_FILE_NOT_EXIST = "Results file does not exist - checking again";
const RES_LOG_RESULTS_FILE_EMPTY = "Results file empty - checking again";
const RES_LOG_RESULTS_FILE_FOUND = "Found populated results file";
const RES_LOG_RESULTS_FILE_CONTENT = "Results file content:";
const RES_ERR_MAX_WAITS_EXCEEDED = "Exceeded maximum number of waits; aborting kernel operation.";
const RES_ERR_KERNEL_FAULT = "Error during computation; aboring operation.";

class KernelOperations {
    
    constructor() {
        logger.Info(RES_LOG_STARTING_KERNEL);

        this.kernel = new defaultKernel();
        this.kernel.Initialize();

        this.hasKernelError = false;

        // Setup error traps for errors, set flags and fail Promise
        this.kernel.on("error", (err) => {
            this.hasKernelError = true;
        });

        this.kernel.on("close", (err) => {
            logger.Error(RES_LOG_RESTARTING_KERNEL);
            this.kernel.Initialize();
        });
    }

    SubmitInputJob(blob) {
        return new Promise(async (resolve, reject) => {
            // 1. Publish input image
            logger.Info(RES_LOG_WRITING_IMG_TO_FILE);
            let jobId = Date.now().toString();
            let fileName = `./data/images/${jobId}.png`;
            fs.writeFileSync(fileName, blob);

            // 2. Wait for the results file
            const resultsFilePath = `./data/results/${jobId}.json`;

            // 2a. Check that the file exists
            let checkCount = 0;
            while ((!fs.existsSync(resultsFilePath)) && (!this.hasKernelError)) {
                logger.Info(RES_LOG_RESULTS_FILE_NOT_EXIST);
                checkCount++;
                if (checkCount > MAX_CHECKS){
                    reject(RES_ERR_MAX_WAITS_EXCEEDED);
                    return;
                }
                await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
            }

            // Check for kernel errors
            if (this.hasKernelError){
                this.hasKernelError = false;
                reject(RES_ERR_KERNEL_FAULT);
                return;
            }

            // 2b. Make sure it has content
            checkCount = 0;
            while ((fs.statSync(resultsFilePath).size === 0) && (!this.hasKernelError)) {
                logger.Info(RES_LOG_RESULTS_FILE_EMPTY);
                checkCount++;
                if (checkCount > MAX_CHECKS){
                    reject(RES_ERR_MAX_WAITS_EXCEEDED);
                    return;
                }
                await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
            }
            
            // Check for kernel errors
            if (this.hasKernelError){
                this.hasKernelError = false;
                reject(RES_ERR_KERNEL_FAULT);
                return;
            }

            // 3. Load result data
            logger.Info(RES_LOG_RESULTS_FILE_FOUND);
            let results = await new Promise((res, rej) => {
                fs.readFile(resultsFilePath, (err, data) => {
                    if (err) { 
                        rej(err); 
                    } else {
                        const content = data.toString();
                        logger.Info(`${RES_LOG_RESULTS_FILE_CONTENT} ${content}`);
                        res(JSON.parse(content));
                    }
                });
            });

            // Done
            resolve(results);
        });
    }
}

module.exports = KernelOperations;