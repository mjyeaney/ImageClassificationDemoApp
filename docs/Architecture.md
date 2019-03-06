### Architecture

The architecutre of the demo app is fairly straightforward, following the typical pattern for Electron-style apps. Mapping the functional areas to source files gives the following:

* Startup (`main.js`)
    * Primary UI (`index.html`, `index.css`, `index.js`)
        * Views
            * `views/AboutView.js`
            * `views/InspectionsView.js`
            * `views/LogView.js`
            * `views/SettingsView.js`
        * Services
            * `services/LoggingProvider.js`
            * `services/SetingsProvider.js`
            * `services/DefaultKernel.js`
            * `services/KernelOperation.js`

Note the application is NOT using any specific UI framework to support view separation; this is intentional. Specific builds are welcome to leverage such frameworks as needed.