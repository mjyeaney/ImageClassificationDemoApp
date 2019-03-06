### Kernel Data Exchange

Bi-directional data exchange with the application kernel is handled via a simple, cross-platform file interface convention. While there are definitely specific platform methods for monitoring file changes (such as Windows file change notifications), the goal is a simple, testable interface that is easily portable to other environment that may not have such capabilities.

Note we are also not leveraging `STDIN` / `STDOUT` for data passing; due to the potentially large size of the input images, we wanted to avoid buffering issues in the `STDIN` buffer. 

The basic workflow for kernel data exchange is as follows:

1. Kernel monitors input folder for new image
2. If image found, process and generate compatible results file.
3. Write results file to output folder.

From the "client" portion of the application, the following workflow is used:

1. Client generates job id to identify specific operation.
2. Client writes image to input folder using job id as a filename.
3. Client begins polling for a results file matching the job id.
4. Once the reuslts file is found, the JSON payload is parsed and used to update the UI.

