// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const remote = require("electron").remote;
const $ = require("jquery");
const Logger = require("./services/LoggingProvider");
const SettingsProvider = require("./services/SettingsProvider");
const InspectionsView = require("./views/InspectionsView");
const SettingsView = require("./views/SettingsView");
const LogView = require("./views/LogView");
const AboutView = require("./views/AboutView");

let main = async () => {

    Logger.Info("Starting up");

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

    await SettingsProvider.Load();

    const inspectionUi = new InspectionsView();
    const settingUi = new SettingsView();
    const logUi = new LogView();
    const aboutUi = new AboutView();

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
            Logger.Info("Saving settings properties");
            await settingUi.Save();            
            forceSettingsSave = false;
        }

        switch (navElements.indexOf(sourceElmId)) {
            case 0:
                Logger.Info("Loading camera inspection content...");
                inspectionUi.Show();
                settingUi.Hide();
                logUi.Hide();
                aboutUi.Hide();
                break;
            
            case 1:
                Logger.Info("Loading settings content...");
                forceSettingsSave = true;
                inspectionUi.Hide();
                settingUi.Show();
                logUi.Hide();
                aboutUi.Hide();
                break;
            
            case 2:
                Logger.Info("Loading log viewer content...");
                inspectionUi.Hide();
                settingUi.Hide();
                logUi.Show();
                aboutUi.Hide();
                break;
            
            case 3:
                Logger.Info("Loading about content...");
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

    Logger.Info("Initializing UI");
    inspectionUi.Show();
};

main();