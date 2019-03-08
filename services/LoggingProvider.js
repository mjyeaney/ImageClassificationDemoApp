/*

Provides logging functionality for the application services.

*/

const settingsProvider = require("./SettingsProvider");
const fs = require("fs");

class LoggingProvider {

    constructor() {
        this.listeners = [];
    }

    RegisterListener(listener) {
        this.listeners.push(listener);
    }

    Info (message) {
        this.Write("INFO", message);
    }

    Error (message) {
        this.Write("ERROR", message);
    }

    Write(level, message) {
        let now = new Date().toISOString();
        let formattedMessage = `${now}: ${level} - ${message}\n`;

        // Persist the log entries
        fs.appendFile(settingsProvider.LogFilePath, formattedMessage, (err) => {
            if (err){
                console.log("FATAL ERROR WRITING LOG FILE");
                console.log(err.toString());
            }
        });

        // Notify all subscribers
        for (let i = 0; i < this.listeners.length; i++){
            try {
                this.listeners[i](formattedMessage)
            } catch {
                // Nothing..move on to next subscriber
            }
        }
    }
}

module.exports = new LoggingProvider();