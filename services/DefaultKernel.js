/*

Hanldes communication with our kernel; 

*/

const spawn = require("child_process").spawn;
const logger = require("./LoggingProvider");
const settings = require("./SettingsProvider");
const emitter = require("events").EventEmitter;

const RES_LOG_KERNEL_STARTUP = "Staring kernel process";
const RES_LOG_KERNEL_STARTED = "Kernel successfully started";
const RES_LOG_KERNEL_SHUTDOWN = "Kernel terminated";

class DefaultKernel extends emitter {
    Initialize() {
        logger.Info(RES_LOG_KERNEL_STARTUP);

        this.child_process = spawn(settings.KernelCommand, ["-u", settings.KernelArguments]);

        this.child_process.on("exit", (code, signal) => {
            logger.Error(RES_LOG_KERNEL_SHUTDOWN)
            this.emit("close");
        });

        this.child_process.stdout.on("data", (data) => {
            logger.Info(data);
        });

        this.child_process.stderr.on("data", (data) => {
            logger.Error(data);
            this.emit("error", data);
        });

        logger.Info(RES_LOG_KERNEL_STARTED);
    }
}

module.exports = DefaultKernel;