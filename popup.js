console.log("Popup Loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  var main = document.getElementById("main");
  var loading = main.findId("loading");
  var maps = main.findId("mapsURL");
  var lng = main.findId("long");
  var lt = main.findId("lat");

  if (message.action === "onDataReceive") {
    var data = message.data;
    loading.innerText = "The current coordinates are:";
    lng.innerText = data.long;
    lt.innerText = data.lat;
    maps.innerText = "View on Google Maps";
    maps.href = data.mapsURL;
  }
  if (message.action === "onNoURL") {
    loading.innerText = "Go into a GeoGuessr game to get the location.";
    lng.innerText = "";
    lt.innerText = "";
    maps.innerText = "";
  }
});

HTMLElement.prototype.findId = function (_id) {
  var childs = this.childNodes;

  for (var i = 0; i < childs.length; i++) {
    if (childs[i].nodeType == Node.ELEMENT_NODE) {
      if (childs[i].id == _id) {
        return childs[i];
      }
    }
  }

  return null;
};

chrome.runtime.sendMessage({ action: "fetchData" });
