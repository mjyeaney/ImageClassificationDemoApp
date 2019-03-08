/*

Manages the log viewer portion of the app.

*/

const $ = require("jquery");
const logger = require("../services/LoggingProvider");

class LogView {
    constructor() {
        logger.RegisterListener(this.Update);
    }

    async EnsureBinding() {
        $("#btnClearLog").click(() => {
            $("#logViewer").text("");
        });
    }

    Show() {
        $("#logs_panel").show();
    }

    Hide() {
        $("#logs_panel").hide();
    }

    Update(message) {
        $("#logViewer").append(message);
        $("#logViewer").scrollTop(1e5);
    }
}

// export this class
module.exports = LogView;