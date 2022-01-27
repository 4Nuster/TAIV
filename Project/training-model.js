// in this step we load the dataset created in the previous sketch
// and use it to train our neural network
// the process can be done in one step, but saving the dataset separately is better in case
// changes were needed to be made to the network

let neuralNetwork;

function setup() {
  createCanvas(640, 480);
  
// same parameters as before
  let params = {
    inputs: 34,
    outputs: 5,
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(params);
// loading the dataset
  neuralNetwork.loadData('dataset.json', dataReady);
}

function dataReady() {
// since the coordinates vary depending on the size of the image, they need to be normalized
// as the neural network expects values from 0 to 1, the function "normalizeData" does just that
  neuralNetwork.normalizeData();
  
// since the dataset is handmade, it is quite small, and thus the number of epochs was set
// to be high (30), throughout our testing, we found out that anything between 20~30 epochs
// gives good results
  neuralNetwork.train({epochs: 30}, finished); 
}

function finished() {
  console.log('finished training');

// the trained model is saved for the next step
  neuralNetwork.save();
}