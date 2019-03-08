/* 

Manages all settings reading/setting for the application.

*/

const $ = require("jquery");
const settingsProvider = require("../services/SettingsProvider");

class SettingsView {
    async EnsureBinding() {
        let deviceList = $("#availableDevices");
                
        for (let device of settingsProvider.MediaDevices) {
            let option = new Option(device.label, device.deviceId);
            if (device.deviceId === settingsProvider.DefaultMediaDeviceId){
                option.selected = true;
            }
            deviceList[0].options.add(option);
        }

        $("#modelThreshold").change(() => {
            $("#modelThresholdPreview span").text($("#modelThreshold").val());
        });

        $("#modelThreshold").val(settingsProvider.ModelThreshold);
        $("#modelThresholdPreview span").text(settingsProvider.ModelThreshold);
        $("#kernelCommand").val(settingsProvider.KernelCommand);
        $("#kernelArguments").val(settingsProvider.KernelArguments);
        $("#logFilePath").val(settingsProvider.LogFilePath);
        $("#modelLastUpdate").text(settingsProvider.ModelLastUpdate);
        $("#modelLastUpdateStatus").text(settingsProvider.ModelLastUpdateStatus);
    }

    Show() {
        $("#settings_panel").show();
    }

    Hide() {
        $("#settings_panel").hide();
    }

    async Save() {
        // Sync UI values and update settingsProvider
        settingsProvider.DefaultMediaDeviceId = $("#availableDevices").val();
        settingsProvider.ModelThreshold = $("#modelThreshold").val();
        settingsProvider.KernelCommand = $("#kernelCommand").val();
        settingsProvider.KernelArguments = $("#kernelArguments").val();
        settingsProvider.LogFilePath = $("#logFilePath").val();
        settingsProvider.ModelLastUpdate = $("#modelLastUpdate").text();
        settingsProvider.ModelLastUpdateStatus = $("#modelLastUpdateStatus").text();
        await settingsProvider.Save();
    }
}

module.exports = SettingsView;