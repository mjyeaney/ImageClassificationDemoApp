/* 

Workflow for the insepction process. This handles all the orchestration for an
operator to take a picture, analyze, and display results.

*/

const $ = require("jquery");
const logger = require("../services/LoggingProvider");
const settingsProvider = require("../services/SettingsProvider");
const kernelOperations = require("../services/KernelOperations");

class InspectionsView {

    constructor() {
        this.kernelOperations = new kernelOperations();
    }

    EnsureBinding() {
        // Grab elements, create settings, etc.
        const previewStream = $("#previewStream");
        const cameraImage = $("#cameraImage");
        const analysisResults = $(".analysisResults");
        const context = cameraImage[0].getContext("2d");

        // Get access to the camera!
        const setupCameraPreview = (deviceId) => {
            logger.Info(`Setting up media preview for device: ${deviceId}`);
            // Not adding `{ audio: true }` since we only want video access
            navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: {
                        min: 1280
                    }, 
                    height: {
                        min: 720
                    },
                    deviceId: deviceId
                }
            }).then((stream) => {
                previewStream[0].srcObject = stream;
                previewStream[0].play();
            });
        };
        
        logger.Info("Populating list of available media devices");
        let deviceList = $("#deviceList");        
        for (let device of settingsProvider.MediaDevices) {
            let option = new Option(device.label, device.deviceId);
            if (device.deviceId === settingsProvider.DefaultMediaDeviceId){
                option.selected = true;
            }
            deviceList[0].options.add(option);
        }

        deviceList.on("change", () => {
            logger.Info("Changing selected media device...");
            setupCameraPreview(deviceList[0].selectedOptions[0].value);
        });

        // If there is at least one media device present, setup a preview
        if (deviceList[0].options.length > 0){
            logger.Info("Selecting default media device");
            setupCameraPreview(deviceList[0].selectedOptions[0].value);
        }

        // Trigger photo take
        $("#snap").on("click", async () => {
            // Update visual state to show results
            logger.Info("Acquiring image for analysis - updating UI state");
            context.drawImage(previewStream[0], 0, 0, 800, 450);
            previewStream.addClass("results");
            cameraImage.addClass("results");
            analysisResults.addClass("results");

            // Save the canvas picture as a file
            logger.Info("Reading camera pixel data into Buffer");
            let dataUrl = cameraImage[0].toDataURL();
            let rawData = dataUrl.replace(/^data:image\/\w+;base64,/, "");
            let blob = Buffer.from(rawData, 'base64');

            // Call kernel operation
            let results = await this.kernelOperations.SubmitInputJob(blob);

            // Generate label / weight display
            let resultBuffer = [];            
            resultBuffer.push("<ul>");
            for (let w in results.weights) {
                let label = results.labels[w];
                let weight = results.weights[w];                
                let minWidth = 0.25;
                let maxWidth = 28;
                let width = Math.max(minWidth, weight * maxWidth);
                resultBuffer.push(`<li>${label}<span class="barGraph" data-width="${width.toFixed(1)}"></span></li>`);
            }
            resultBuffer.push("</ul>");

            // update final UI state
            $("#resultsPlaceholder").html(resultBuffer.join(''));
            $("#resultsStatus").hide();
            $("span.barGraph").each(function() { 
                $(this).width(`${$(this).data("width")}em`);
            })
        });

        $("#clear").on("click", () => {
            // Restore initial visual state
            logger.Info("Clearing image buffer...");
            previewStream.removeClass("results");
            cameraImage.removeClass("results");
            analysisResults.removeClass("results");
            $("#resultsStatus").show();
            $("#resultsPlaceholder").html("");
            context.clearRect(0, 0, cameraImage[0].width, cameraImage[0].height);
        });
    }

    Show() {
        $("#inspection_panel").show();
    }

    Hide() {
        $("#inspection_panel").hide();
    }
}

// export this class
module.exports = InspectionsView;