/*

Provider for reading / writing settings for the entire app.

*/

const fs = require("fs");

const SETTINGS_FILE_PATH = "./data/config/settings.json";

class SettingsProvider {
    constructor() {
        this.MediaDevices = [];
        this.DefaultMediaDeviceId = null;
        this.ModelThreshold = "1.0";
        this.KernelCommand = "";
        this.KernelArguments = "";
        this.ModelUrl = "";
        this.ModelLastUpdate = "Unknown";
        this.ModelLastUpdateStatus = "Unknown";
        this.LogFilePath = "./data/log.txt";
    }

    async Load() {
        return new Promise((resolve) => {
            // 1. Read settings from JSON file
            fs.readFile(SETTINGS_FILE_PATH, (err, data) => {
                if (data){
                    let settingsBlob = JSON.parse(data.toString());
                    this.DefaultMediaDeviceId = settingsBlob.DefaultMediaDeviceId;
                    this.ModelThreshold = settingsBlob.ModelThreshold;
                    this.KernelCommand = settingsBlob.KernelCommand;
                    this.KernelArguments = settingsBlob.KernelArguments;
                    this.ModelUrl = settingsBlob.ModelUrl;
                    this.ModelLastUpdate = settingsBlob.ModelLastUpdate;
                    this.ModelLastUpdateStatus = settingsBlob.ModelLastUpdateStatus
                    this.LogFilePath = settingsBlob.LogFilePath;
                }

                // 2. Enumerate media devices
                this.MediaDevices = [];
                navigator.mediaDevices.enumerateDevices().then((devices) => {
                    for (let device of devices) {
                        if (device.kind === "videoinput"){
                            this.MediaDevices.push(device);
                        }
                    }

                    // Done!
                    resolve();
                });
            });
        });
    }

    async Save() {
        return new Promise((resolve) => {
            // Write settings to JSON file
            let settingsBlob = {};
            settingsBlob.DefaultMediaDeviceId = this.DefaultMediaDeviceId;
            settingsBlob.ModelThreshold = this.ModelThreshold;
            settingsBlob.KernelCommand = this.KernelCommand;
            settingsBlob.KernelArguments = this.KernelArguments;
            settingsBlob.ModelUrl = this.ModelUrl;
            settingsBlob.ModelLastUpdate = this.ModelLastUpdate;
            settingsBlob.ModelLastUpdateStatus = this.ModelLastUpdateStatus;
            settingsBlob.LogFilePath = this.LogFilePath;
            fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(settingsBlob), (err) => {
                resolve();
            });
        });
    }
}

module.exports = new SettingsProvider();