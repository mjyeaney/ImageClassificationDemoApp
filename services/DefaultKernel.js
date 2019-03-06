/*

Hanldes communication with our kernel; 

*/

const spawn = require("child_process").spawn;
const Logger = require("./LoggingProvider");
const Settings = require("./SettingsProvider");
const emitter = require("events").EventEmitter;

class DefaultKernel extends emitter {
    Initialize() {
        Logger.Info("Starting kernel process...");

        this.child_process = spawn(Settings.KernelCommand, [Settings.KernelArguments]);

        this.child_process.on("exit", (code, signal) => {
            // Crash!!!
            this.emit("close");
        });

        this.child_process.stdout.on("data", (data) => {
            Logger.Info(data);
        });

        this.child_process.stderr.on("data", (data) => {
            Logger.Error(data);
            this.emit("error", data);
        });

        Logger.Info("Kernel successfully started");
    }
}

module.exports = DefaultKernel;