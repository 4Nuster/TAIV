// In this sketch (generating-dataset) we will create and save the dataset
// that will be used by our neural network in the other sketches.
// The dataset will be made using the output of the poseNet neural network,
// where each pose will be labeled for classification

// declaring variables
let video, poseNet, pose, skeleton
let neuralNetwork;
let collecting = false;
let targeLabel;

// recording keypresses, each keypress will be used as a label
// at the exception of the key "s" which is used to save the generated dataset
function keyPressed(){
  if(key == 's'){
    neuralNetwork.saveData();
    console.log('dataset saved');
  }
  else{

// when a key is pressed, we give the user 5 seconds to get ready to make a pose
// after that, poses will be recorded (labeled with the pressed key) and saved
// into the dataset

// currently we only set the state (the 'collecting' variable)
// the poses are saved in the 'gotPoses' function
    targetLabel = key;
    console.log(targetLabel);
    
    setTimeout(function() {
      console.log('collecting');
      collecting = true;
      
      setTimeout(function() {
        console.log('finished collecting');
        collecting = false;
      }, 10000);
    
    }, 5000);
  }
}

function setup() {
  createCanvas(640, 480);

// setting up the webcam
  video = createCapture(VIDEO);
  video.hide();
  
// loading the PoseNet neural network, and passing the webcam stream to it
  poseNet = ml5.poseNet(video, modelLoaded);
// registering poses
  poseNet.on('pose', gotPoses);

// creating our personal neural network
  let params = {
// 34 inputs (17 keypoints * 2 coordinates)
    inputs: 34,
// 5 outputs (5 classes of poses)
    outputs: 5,    
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(params);
}

function gotPoses(poses) {
// check if PoseNet detected a pose
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    
// check the state of the 'collecting' variable to add poses into the dataset
    if (collecting) {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        
// append all skeleton keypoints into a single array for simplicity
        inputs.push(x);
        inputs.push(y);
      }
// create label from keypress
      let target = [targetLabel];
// save pose with label
      neuralNetwork.addData(inputs, target);
    }
  }
}

function modelLoaded() {
  console.log('poseNet ready');
}

// display loop
function draw() {
// mirror image for webcam ease of use
  translate(video.width, 0);
  scale(-1, 1);
// display frame
  image(video, 0, 0, video.width, video.height);

// check and get current pose (to display it)
  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

// display lines between the skeleton's keypoints
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
// display skeleton keypoints
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 10, 10);
    }
  }
}