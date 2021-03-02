const images = ["fox1", "fox2", "fox3", "fox4"];
const imgElem = document.querySelector("img");

function randomValueFromArray(array) {
  const randomNo = Math.floor(Math.random() * array.length);
  return array[randomNo];
}

setInterval(() => {
  const randomChoice = randomValueFromArray(images);
  imgElem.src = `images/${randomChoice}.jpg`;
}, 2000);

// Register service worker to control making site work offline

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(() => {
    console.log("Sample Service Worker Registered");
  });
}

// Code to handle install prompt on desktop

let deferredPrompt;
const installButton = document.getElementById("install-button");
installButton.style.display = "none";

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  installButton.style.display = "block";

  installButton.addEventListener("click", () => {
    // hide our user interface that shows our A2HS button
    installButton.style.display = "none";
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the Installation prompt");
      } else {
        console.log("User dismissed the Installation prompt");
      }
      deferredPrompt = null;
    });
  });
});

const wsUri = "wss://echo.websocket.org/";
let output, websocket;
const offlineMenu = document.getElementById("offline-menu");
const onlineMenu = document.getElementById("online-menu");
const connectButton = document.getElementById("connect");
const disconnectButton = document.getElementById("disconnect");
const submitButton = document.getElementById("submit");

function init() {
  output = document.getElementById("output");
  onlineMenu.style.display = "none";
}

function connectWebSocket() {
  websocket = new WebSocket(wsUri);
  websocket.onopen = function (evt) {
    onOpen(evt);
  };
  websocket.onclose = function (evt) {
    onClose(evt);
  };
  websocket.onmessage = function (evt) {
    onMessage(evt);
  };
  websocket.onerror = function (evt) {
    onError(evt);
  };
}

function onOpen(evt) {
  writeToScreen(">>> CONNECTED");
  onlineMenu.style.display = "block";
  offlineMenu.style.display = "none";
}

function onClose(evt) {
  writeToScreen("<<< DISCONNECTED");
  onlineMenu.style.display = "none";
  offlineMenu.style.display = "block";
}

function onMessage(evt) {
  writeToScreen('<span style="color: blue;">RESPONSE: ' + evt.data + "</span>");
}

function onError(evt) {
  writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}

function doSend(message) {
  writeToScreen("SENT: " + message);
  websocket.send(message);
}

function writeToScreen(message) {
  var pre = document.createElement("p");
  pre.style.wordWrap = "break-word";
  pre.innerHTML = message;
  output.appendChild(pre);
}

submitButton.addEventListener("click", () => {
  const message = document.getElementById("message");
  if (!message.value) {
    return alert("message is blank");
  }

  doSend(message.value);
  message.value = "";
});

connectButton.addEventListener("click", () => {
  connectWebSocket();
});

disconnectButton.addEventListener("click", () => {
  websocket.close();
});

init();
