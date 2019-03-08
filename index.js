// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const remote = require("electron").remote;
const $ = require("jquery");
const logger = require("./services/LoggingProvider");
const settings = require("./services/SettingsProvider");
const inspectionsView = require("./views/InspectionsView");
const settingsView = require("./views/SettingsView");
const logView = require("./views/LogView");
const aboutView = require("./views/AboutView");

let main = async () => {

    logger.Info("Starting up");

    let isFullScreen = false;
    let currentWindow = remote.getCurrentWindow();
    let forceSettingsSave = false;

    //
    // Statusbar/logging helpers methods
    //

    const setCoreStatus = (isReady, context) => {
        let coreStatus = document.getElementById("coreStatus");
        let readyText = isReady ? "Ready" : "";
        let contextText = context != "" ? ` (${context})` : "";
        coreStatus.innerText = `${readyText}${contextText}`;
    };

    const updateOnlineStatus = () => {
        $("#statusBar ul.right li").text(navigator.onLine ? "Online" : "Not Connected");
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    //
    // Workflow / service creation
    //

    await settings.Load();

    const inspectionUi = new inspectionsView();
    const settingUi = new settingsView();
    const logUi = new logView();
    const aboutUi = new aboutView();

    inspectionUi.EnsureBinding();
    settingUi.EnsureBinding();
    logUi.EnsureBinding();
    aboutUi.EnsureBinding();

    //
    // Top/global event listeners
    //

    document.addEventListener('keydown', (event) => {
        const keyName = event.key;

        if (keyName.toLowerCase() === "control") {
            // do not alert when only Control key is pressed.
            return;
        }

        if (event.ctrlKey) {
            // Even though event.key is not 'Control' (e.g., 'a' is pressed),
            // event.ctrlKey may be true if Ctrl key is pressed at the same time.
            //alert(`Combination of ctrlKey + ${keyName}`);
        } else {
            if (keyName === "F11"){
                currentWindow.setFullScreen(!isFullScreen);
                isFullScreen = !isFullScreen;
                setCoreStatus(true, isFullScreen ? "fullscreen" : "");
            }

            if (keyName === "F12"){
                currentWindow.webContents.openDevTools();
            }
        }
    }, false);

    document.addEventListener("click", async (event) => {
        let sourceElmId = event.srcElement.id;
        let navElements = ["nav_inspection", "nav_settings", "nav_logs", "nav_about"];
        let isNavEvent = (navElements.indexOf(sourceElmId) > -1);

        if ((isNavEvent) && (forceSettingsSave)){
            logger.Info("Saving settings properties");
            await settingUi.Save();            
            forceSettingsSave = false;
        }

        switch (navElements.indexOf(sourceElmId)) {
            case 0:
                logger.Info("Loading camera inspection content...");
                inspectionUi.Show();
                settingUi.Hide();
                logUi.Hide();
                aboutUi.Hide();
                break;
            
            case 1:
                logger.Info("Loading settings content...");
                forceSettingsSave = true;
                inspectionUi.Hide();
                settingUi.Show();
                logUi.Hide();
                aboutUi.Hide();
                break;
            
            case 2:
                logger.Info("Loading log viewer content...");
                inspectionUi.Hide();
                settingUi.Hide();
                logUi.Show();
                aboutUi.Hide();
                break;
            
            case 3:
                logger.Info("Loading about content...");
                inspectionUi.Hide();
                settingUi.Hide();
                logUi.Hide();
                aboutUi.Show();
                break;
        }
    }, false);

    //
    // Startup / bootstrap
    //

    logger.Info("Initializing UI");
    inspectionUi.Show();
};

main();