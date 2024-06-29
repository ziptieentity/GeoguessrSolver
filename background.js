let url = "";
let onGeoGessur = false;
let lastData = null;

chrome.tabs.onActivated.addListener(function (tab) {
  if (tab === undefined || tab === null) {
    onGeoGessur = false;
    return;
  }
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let foundUrl = tabs[0].url;
    setURL(foundUrl);
  });
});

chrome.tabs.onUpdated.addListener(function (tab) {
  if (tab === undefined || tab === null) {
    onGeoGessur = false;
    return;
  }
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let foundUrl = tabs[0].url;
    setURL(foundUrl);
  });
});

function setURL(foundUrl) {
  if (foundUrl === undefined || foundUrl === null) {
    onGeoGessur = false;
    return;
  }

  if (foundUrl.includes("geoguessr.com/game/")) {
    url =
      "https://www.geoguessr.com/api/v3/games/" +
      foundUrl.split("geoguessr.com/game/")[1];
    console.log(url);
    onGeoGessur = true;
    return;
  }
  if (foundUrl.includes("geoguessr.com/live-challenge/")) {
    url =
      "https://game-server.geoguessr.com/api/live-challenge/" +
      foundUrl.split("geoguessr.com/live-challenge/")[1];
    console.log(url);
    onGeoGessur = true;
    return;
  }
  onGeoGessur = false;
  url = "";
}

function fetchGameData() {
  fetch(url)
    .then((response) => (response !== undefined ? response.json() : undefined))
    .then((data) => {
      if (data === undefined) return;
      console.log("Fetched data:", data);
      let length = data.rounds.length;
      console.log("Rounds", length);
      if (data.rounds[length - 1] === undefined) return;

      var long = 0;
      var lat = 0;

      if (url.includes("game-server.geoguessr.com")) {
        long =
          data.rounds[length - 1].answer.coordinateAnswerPayload.coordinate.lng;
        lat =
          data.rounds[length - 1].answer.coordinateAnswerPayload.coordinate.lat;
      }
      if (url.includes("www.geoguessr.com")) {
        long = data.rounds[length - 1].lng;
        lat = data.rounds[length - 1].lat;
      }
      console.log("Long", long);
      console.log("Lat", lat);

      lastData = {
        long: long,
        lat: lat,
        mapsURL: `https://www.google.com/maps?q&layer=c&cbll=${lat},${long}`,
      };
      chrome.runtime.sendMessage({
        action: "onDataReceive",
        data: lastData,
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (url === "" || url === null || !onGeoGessur) {
    chrome.runtime.sendMessage({ action: "onNoURL" });
    return;
  }
  if (message.action === "fetchData") {
    fetchGameData();
  }
});
