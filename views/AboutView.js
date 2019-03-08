/*

Display the infomration on the "About" screen.

*/

const $ = require("jquery");
const logger = require("../services/LoggingProvider");

const RES_LOG_OPENING_GITHUB = "Opening GitHub link in default browser";

class AboutView {
    async EnsureBinding() {
        $("#gitHubLink").click((event) => {
            logger.Info(RES_LOG_OPENING_GITHUB);
            event.preventDefault();
            shell.openExternal(event.target.href);
        });
    }

    Show() {
        $("#about_panel").show();
    }

    Hide() {
        $("#about_panel").hide();
    }
}

module.exports = AboutView;