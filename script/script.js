'use strict';

const constraints = window.constraints = {
  audio: false,
  video: true
};

var agent;
var equipmts;

const video = document.querySelector('video');

window.onload = init;

document.querySelector('#takePhotoBtn').addEventListener('click', e => takePhoto(e));
document.getElementById('loading').addEventListener('click', e => e.stopPropagation());

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
  document.getElementById('loading').classList.remove('displayNone');
  var context;
  var width = video.offsetWidth, height = video.offsetHeight;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, width, height);

  var data = canvas.toDataURL().substr(22, canvas.toDataURL().length);
  ajaxPost('http://localhost:8080/face', data, connexion);
}

function connexion(response) {
  if(response === null || response === "" || response === undefined){
    document.getElementById('loading').classList.add('displayNone');
    document.getElementById('fail').classList.remove('displayNone');
  } else {
    document.getElementById('loading').classList.add('displayNone');
    document.getElementById('login').classList.add('displayNone');
    document.getElementById('params').classList.remove('displayNone');
    agent = JSON.parse(response);
    document.getElementById('welcome').innerHTML = "Bonjour, " + agent.firstName + " " + agent.lastName;
    document.getElementById('pictureEmployee').setAttribute('src', 'data:image/png;base64,'+ agent.urlPhoto);

    ajaxGet('http://localhost:8080/local', equipmentDisplay);
  }
}

function reloadPage(){
  location.reload();
}

function equipmentDisplay(response) {
  equipmts = JSON.parse(response);
  if(agent.items.length > 0) {
    for( const item of agent.items){
      document.getElementById(item).checked = true;
    }
  }
  for(const item of Object.keys(equipmts)){
    if(equipmts[item] === 0 ){
      if(document.getElementById(item).checked === false){
        document.getElementById(item).disabled = true;
      }
    }
  }
}

function doNothing() {
  document.getElementById('loading').classList.add('displayNone');
}

function addRemoveItem(item) {
  document.getElementById('loading').classList.remove('displayNone');
  if(contains(agent.items, item)){
    ajaxGet('http://localhost:8080/user/'+agent.id+'/remove/'+item, doNothing)
  } else {
    ajaxGet('http://localhost:8080/user/'+agent.id+'/give/'+item, doNothing)
  }
}

function contains(array, item){
  for (const element of array){
    if( element === item ) {
      return true;
    }
  }
  return false;
}

function displayContent() {
  document.getElementById('fail').classList.add('displayNone');
}

function ajaxPost(url, data, callback) {
  var formData = new FormData();
  formData.append('img64', data);
  var req = new XMLHttpRequest();
  req.open("POST", url);
  req.addEventListener("load", function () {
      if (req.status >= 200 && req.status < 400) {
          callback(req.responseText);
      } else {
        callback(null);
      }
  });
  req.addEventListener("error", function () {
      console.error("Erreur réseau avec l'URL " + url);
  });
  req.send(formData);
}

function ajaxGet(url, success) {
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('GET', url);
  xhr.onreadystatechange = function() {
      if (xhr.readyState>3 && xhr.status==200) success(xhr.responseText);
  };
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send();
  return xhr;
}