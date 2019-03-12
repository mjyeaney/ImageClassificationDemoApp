/* 

Workflow for the insepction process. This handles all the orchestration for an
operator to take a picture, analyze, and display results.

*/

const $ = require("jquery");
const logger = require("../services/LoggingProvider");
const settingsProvider = require("../services/SettingsProvider");
const kernelOperations = require("../services/KernelOperations");

const RES_LOG_SETUP_PREVIEW = "Setting up media preview for device";
const RES_LOG_POPULATING_MEDIA_DEVICES = "Populating list of avaiable media devices";
const RES_LOG_CHANGING_DEVICE = "Changing selected media device";
const RES_LOG_SELECT_DEFAULT_DEVICE = "Selecting default media device";
const RES_LOG_ACQUIRE_IMAGE = "Acquiring image for analysis";
const RES_LOG_READING_PIXEL_DATA = "Reading camera pixel data into Buffer";
const RES_LOG_CLEAR_PIXEL_DATA = "Clearing image buffer";

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
            logger.Info(`${RES_LOG_SETUP_PREVIEW}: ${deviceId}`);
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
        
        logger.Info(RES_LOG_POPULATING_MEDIA_DEVICES);
        let deviceList = $("#deviceList");        
        for (let device of settingsProvider.MediaDevices) {
            let option = new Option(device.label, device.deviceId);
            if (device.deviceId === settingsProvider.DefaultMediaDeviceId){
                option.selected = true;
            }
            deviceList[0].options.add(option);
        }

        deviceList.on("change", () => {
            logger.Info(RES_LOG_CHANGING_DEVICE);
            setupCameraPreview(deviceList[0].selectedOptions[0].value);
        });

        // If there is at least one media device present, setup a preview
        if (deviceList[0].options.length > 0){
            logger.Info(RES_LOG_SELECT_DEFAULT_DEVICE);
            setupCameraPreview(deviceList[0].selectedOptions[0].value);
        }

        // Trigger photo take
        $("#snap").on("click", async () => {
            // Update visual state to show results
            logger.Info(RES_LOG_ACQUIRE_IMAGE);
            context.drawImage(previewStream[0], 0, 0, 800, 450);
            previewStream.addClass("showResults");
            cameraImage.addClass("showResults");
            analysisResults.addClass("showResults");

            // Save the canvas picture as a file
            logger.Info(RES_LOG_READING_PIXEL_DATA);
            let dataUrl = cameraImage[0].toDataURL();
            let rawData = dataUrl.replace(/^data:image\/\w+;base64,/, "");
            let blob = Buffer.from(rawData, 'base64');

            // Call kernel operation
            try {
                // compute
                let results = await this.kernelOperations.SubmitInputJob(blob);

                // Generate label / weight display for bar graph
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

                // update final UI state and show threshold marker
                analysisResults.addClass("finished");
                analysisResults.width(`${(settingsProvider.ModelThreshold * 30).toFixed(1)}em`);
                $("#thresholdMarker").text(settingsProvider.ModelThreshold);

                // Display the weight bars we generated above
                $("#resultsPlaceholder").html(resultBuffer.join(''));

                // Hide the "busy" message
                $("#resultsStatus").hide();

                // Set the width of the bar graph to trigger animations
                $("span.barGraph").each(function() { 
                    $(this).width(`${$(this).data("width")}em`);
                });
            } catch (err) {
                alert(`ERROR: ${err}`);
                $("#clear").click();        
            }
        });

        $("#clear").on("click", () => {
            // Restore initial visual state..reset original state
            logger.Info(RES_LOG_CLEAR_PIXEL_DATA);
            previewStream.removeClass("showResults");
            cameraImage.removeClass("showResults");
            analysisResults.removeClass("showResults");
            analysisResults.removeClass("finished");
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