/*

Implements the next-step descision workflow given a set of class weights, lables and a threshold.

Note this is a sample workflow implementation - could be as complicated as needed.

*/

const RES_NO_CLASS_EXCEEDED_THRESHOLD = "No weights exceeded configured threshold";
const RES_CLASSES_MATCHED = "Image matched following classes:";

class DecisionWorkflow {

    EvaluateResults(modelWeights, labels, threshold){
        // See if any of the model weights are above the threshold
        const matchingLabels = [];
        for (let w in modelWeights){
            if (modelWeights[w] > threshold){
                // Found one - capture class name
                matchingLabels.push(labels[w]);
            }
        }

        // Generate response based on whether we found any weights
        let response = RES_NO_CLASS_EXCEEDED_THRESHOLD;
        if (matchingLabels.length > 0){
            response = `${RES_CLASSES_MATCHED} ${matchingLabels.join(", ")}`;
        }

        // Done!
        return response;
    }
}

module.exports = new DecisionWorkflow();