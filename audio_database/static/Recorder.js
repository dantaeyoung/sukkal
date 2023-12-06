var Recorder = {}

Recorder.recordingKey = "";
Recorder.records = [];
Recorder.audioData = {};


const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');
const keyDisplay = document.querySelector('.key-display');

// disable stop button while not recording

stop.disabled = true;

// visualiser setup - create web audio api context and canvas

let audioCtx;
const canvasCtx = canvas.getContext("2d");

//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    visualize(stream);

    var startRecord = function(key) {
      mediaRecorder.stop();
      Recorder.recordingKey = key;
      keyDisplay.textContent = key;
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      document.body.classList.add("recording");

      stop.disabled = false;
      record.disabled = true;
    }
    record.onclick = startRecord;
    Recorder.startRecord = startRecord;


    var stopRecord = function(key) {
//      keyDisplay.textContent = "";
      mediaRecorder.stop();
      document.body.classList.remove("recording");
      // mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
    }
    stop.onclick = stopRecord
    Recorder.stopRecord = stopRecord;

    mediaRecorder.onstop = function(e) {

      const rkey = Recorder.recordingKey;

      console.log("data available after MediaRecorder.stop() called.");

      const clipContainer = document.createElement('div');
      const clipKey = document.createElement('div');
      const clipLabel = document.createElement('div');
      const clipTranscript= document.createElement('div');
      const audio = document.createElement('audio');
      const deleteButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete';

      /////
      
      var timestamp = Date.now();
      var audioid = "";
      if(rkey === "") {
        audioid = timestamp;
      } else {
        audioid = Recorder.recordingKey + "--" + timestamp;
      }

      clipKey.classList.add("key")
      clipKey.textContent = rkey;

      clipLabel.classList.add("label")
      clipLabel.textContent = Helpers.format12HourTime(timestamp);
      
      clipTranscript.classList.add("transcript")

      Recorder.records.push({ id: audioid, key: rkey, ts: timestamp })
      

      const pastelColor = Helpers.strToPastelHsl(rkey);

      clipContainer.style.backgroundColor = pastelColor;

      
      /////

      audio.id = audioid;
      clipContainer.classList.add(rkey);
      clipContainer.classList.add(audioid);
      clipContainer.appendChild(clipKey);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(clipTranscript);
      clipContainer.appendChild(audio);
      clipContainer.appendChild(deleteButton);
      soundClips.appendChild(clipContainer);

      window.scroll({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });

      audio.controls = true;
      //const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      const blob = new Blob(chunks, { 'type' : 'audio/wav' });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;

//      Recorder.audioData[audioid] = blob;

      Openai.transcribe(blob, function(text) {
        clipTranscript.textContent = text;
      });
     

      audio.onplay = function() {
        const clipelem = document.querySelector('.clip.' + audio.id);
        clipelem.classList.add('playing');
      }
      audio.onended = function() {
        const clipelem = document.querySelector('.clip.' + audio.id);
        clipelem.classList.remove('playing');
      }

      console.log("recorder stopped");

      Recorder.recordingKey = "";

      deleteButton.onclick = function(e) {
        e.target.closest(".clip").remove();
      }

    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}


Recorder.getLastRecording = function(key) {
  // Filter records by the specified key
  const filteredRecords = Recorder.records.filter(record => record.key === key);

  // Sort the filtered records by timestamp in descending order
  filteredRecords.sort((a, b) => b.ts - a.ts);

  // Return the most recent record or null if no matching records are found
  return filteredRecords.length > 0 ? filteredRecords[0] : null;
}



