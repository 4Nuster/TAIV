let video, poseNet, pose, skeleton;

let neuralNetwork;
let poseLabel = "a";

// all hiragana characters that will be used for testing
let allCharacters = ['あ','い','う','え','お',
                     'か','き','く','け','こ',
                     'が','ぎ','ぐ','げ','ご',
                     'さ','し','す','せ','そ',
                     'ざ','じ','ず','ぜ','ぞ',
                     'た','ち','つ','て','と',
                     'だ','ぢ','づ','で','ど',
                     'な','に','ぬ','ね','の',
                     'は','ひ','ふ','へ','ほ',
                     'ば','び','ぶ','べ','ぼ',
                     'ぽ','ぴ','ぷ','ぺ','ぽ',
                     'ま','み','む','め','も',
                     'ら','り','る','れ','ろ',
                     'や','ゆ','よ','わ','を']

// dividing each group of characters into the coresponding label
let a_chars = ['あ','か','が','さ','ざ','た','だ','な','は','ば','ぽ','ま','ら','や','わ']
let i_chars = ['い','き','ぎ','し','じ','ち','ぢ','に','ひ','び','ぴ','み','り']
let u_chars = ['う','く','ぐ','す','ず','つ','づ','ぬ','ふ','ぶ','ぷ','む','る','ゆ']
let e_chars = ['え','け','げ','せ','ぜ','て','で','ね','へ','べ','ぺ','め','れ']
let o_chars = ['お','こ','ご','そ','ぞ','と','ど','の','ほ','ぼ','ぽ','も','ろ','よ','を']

// variables used to determine the next character
let frame = 0, currentChar;

// 'difficulty' controls the speed at which characters are displayed, the bigger the number
// the slower the speed
let difficulty = 300;

// variables used to count the score (how many characters the user guessed correctly)
let total = 0, score = 0, checked = false;

function setup() {
// code explained in previous sketches
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, poseNetLoaded);
  poseNet.on('pose', gotPoses);

  let params = {
    inputs: 34,
    outputs: 4,
    task: 'classification',
    debug: true
  }
  neuralNetwork = ml5.neuralNetwork(params);

// we load the model created in the previous sketch
  const modelInfo = {
    model: 'model/model.json',
    metadata: 'model/model_meta.json',
    weights: 'model/model.weights.bin',
  };
  neuralNetwork.load(modelInfo, modelLoaded);
}

function modelLoaded() {
  console.log('pose classification ready');
// once the model is loaded, the classification begins
  classifyPose();
}

function classifyPose() {
// get pose if it exists
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }

// classify detected pose
    neuralNetwork.classify(inputs, gotResult);
  } else {
// if pose not found, try again in 100 miliseconds
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
// check the confidence of the classification, if above 70%, the 'poseLabel' variable is updated
  if (results[0].confidence > 0.70) poseLabel = results[0].label;
// commence classifying the next frame
  classifyPose();
}

function gotPoses(poses) {
// get pose if it exists
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function poseNetLoaded() {
  console.log('poseNet ready');
}

// this function increases the score of the user if he guessed correctly
function correct(){
  if(!checked){
    fill(0, 255, 0);
    score++;
    checked = true;
  }
}

function draw() {
// change into the next character and display the score in console
  if (frame == 0) {
    total++;
    checked = false;
    currentChar = Math.floor(Math.random() * allCharacters.length);
    console.log("score:" + score + "/" + total);
  }
  
// "push" and "pop" are used to only mirror the image and not mirror the displayed text
  push();
// code explained in the previous sketches
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 10, 10);
    }
  }
  pop();
  
// display score
  fill(0, 255, 0);
  noStroke();
  textSize(50);
  textAlign(CENTER, TOP);
    
  text("score:" + score + "/" + total, width / 2, 50);

// set up settings to display character that the user has to guess its class
  noStroke();
  textSize(150);
  textAlign(CENTER, CENTER);
  
// check if the user guessed correctly (if the 'poseLabel' variable matches the class
// of the character being displayed), if yes, the character will be shown in green
// otherwise it will be shown in red
// the 'correct()' function handles changing the character's color to green
  
  if(poseLabel == 'a'){
    if(a_chars.includes(allCharacters[currentChar])) correct();
    else fill(255, 0, 0);
  }
  if(poseLabel == 'e'){
    if(e_chars.includes(allCharacters[currentChar])) correct();
    else fill(255, 0, 0);
  }
  if(poseLabel == 'i'){
    if(i_chars.includes(allCharacters[currentChar])) correct();
    else fill(255, 0, 0);
  }
  if(poseLabel == 'u'){
    if(u_chars.includes(allCharacters[currentChar])) correct();
    else fill(255, 0, 0);
  }
  if(poseLabel == 'o'){
    if(o_chars.includes(allCharacters[currentChar])) correct();
    else fill(255, 0, 0);
  }
  
// display character
  text(allCharacters[currentChar], width / 2, height * 3 / 4);
  
// update variable responsible of generating the next character
  frame = (frame + 1) % difficulty;
}