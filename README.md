## Image Classificaiton Demo App

Sample cross-platofrm application framework demonstrating interaction between ElectronJS and a Python kernel. The goal of this application isn't any specific model, but rather a method for getting class labels and weights from an underlying kernel.

### Topics

* [Prerequisites](#Prerequisites)
* [Installation](#Installation)
* [Architecture](docs/Architecture.md)
* [Kernel Data Exchange](docs/Kernel-Data-Exchange.md)
* [Data Storage](#Data-Storage)
    * [Configuration Schema](#Configuration-Schema)
    * [Results File Schema](#Results-File-Schema)
* [Using the App](docs/Using-The-App.md)

### Prerequisites

The demo application requires an installation of `NodeJS 10.15.0+` and `Python 3.6+`. These should be available on the current system `PATH`.

### Installation

To build the application, clone this repository and run the following commands:

```
npm i
npm run start
```

### Data Storage

The applicaiton keeps data and configuration details in the `./data` folder. Details of each are:

* `./data/config/settings.json`: Configuration settings for the application
* `./data/images/*.png`: Images that are taken from the application are dropped in this folder.
* `./data/results/*.json`: As compute results are generated from the kernel, results are dumped to this folder.

### Configuration Schema

The configuration files for the application use the following schema:

```
{
    "DefaultMediaDeviceId":"-- Local Device ID for the camera used by default --",
    "ModelThreshold":"-- Sets the cutoff threshold display, used for application-specific features --",
    "KernelCommand":"-- Executable for the compute kernel, defaults to python.exe --",
    "KernelArguments":"-- Arguments to be passed to the compute kernel, defaults to ./kernel/main.py --",
    "ModelUrl":"-- The URL used to download updates to the scoring model --",
    "ModelLastUpdate":"-- Date/time when the model was last updated --",
    "ModelLastUpdateStatus":"-- Status of the last model update (i.e., successful, failed, etc.) --",
    "LogFilePath":"-- Path to the application log file, defaults to ./data/log.txt --"
}
```

### Results File Schema

The results files for the application use the following schema:

```
{
    "weights": [
        -- Array of weights for each label --
    ],
    "labels": [
        -- Labels for each class --
    ]
}
```