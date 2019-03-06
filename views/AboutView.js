/*

Display the infomration on the "About" screen.

*/

const logger = require("../services/LoggingProvider");

class AboutView {
    async EnsureBinding() {
        $("#gitHubLink").click((event) => {
            logger.Info("Opening GitHub link in default browser");
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