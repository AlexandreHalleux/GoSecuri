'use strict';


const constraints = window.constraints = {
  audio: false,
  video: true
};

const video = document.querySelector('video');

window.onload = init;

function handleSuccess(stream) {
  window.stream = stream;
  video.srcObject = stream;
}

async function init(e) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    handleSuccess(stream);
    e.target.disabled = true;
  } catch (e) {
    handleError(e);
  }
}

function takePhoto(e) {

  // CREATION DE L'IMAGE
  var context;
  var width = video.offsetWidth, height = video.offsetHeight;

  const canvas = document.querySelector('#takePhotoCanvas') || document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, width, height);

  document.getElementById('inp_img').value = canvas.toDataURL();
  console.log(document.getElementById('inp_img').value);
}

document.querySelector('#takePhotoBtn').addEventListener('click', e => takePhoto(e));