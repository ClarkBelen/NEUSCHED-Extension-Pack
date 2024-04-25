document.addEventListener("DOMContentLoaded", function () {
  
    if (document.getElementById("getStartedButton")) {
      const getStartedButton = document.getElementById("getStartedButton");

      getStartedButton.addEventListener("click", function () {
  
        const mainPage = "/panels/mainMenuPanel.html";
  
        chrome.sidePanel.setOptions({ path: mainPage });
      });
    }
  
    if (document.getElementById("backToStart")) {
      const backToStart = document.getElementById("backToStart");
  
      backToStart.addEventListener("click", function () {
  
        const welcomePage = "/panels/welcomePanel.html";
  
        chrome.sidePanel.setOptions({ path: welcomePage });
      });
    }
  
    
  
    if (document.getElementById("automateSched")) {
        const automateSched = document.getElementById("automateSched");

        automateSched.addEventListener("click", function () {
            chrome.tabs.create({
            url: "https://neu.edu.ph/main/" //subject to change due to current state of automate
        });
  
        const automatePage = "/panels/neuAutomatePanel.html";
  
        chrome.sidePanel.setOptions({ path: automatePage });
      });
    }
  
    if (document.getElementById("manualInputButton")) {
      const manualInputButton = document.getElementById("manualInputButton");
  
      manualInputButton.addEventListener("click", function () {
        chrome.tabs.create({
          url: "https://froilandelfinjr.github.io/manual_input/", 
        });
  
        const manualInput = "/panels/manualSchedPanel.html";
  
        chrome.sidePanel.setOptions({ path: manualInput });
      });
    }
  
  
    const showSchedule = document.getElementById("showScheduleButton");
  
    if (showSchedule) {
      showSchedule.addEventListener("click", function () {
        chrome.tabs.update({
          url: "https://neu.edu.ph/main/", //subject to change due to current state of automate
        });
      });
    }
  
  
    if (document.getElementById("generateCSVButton")) {
      const generateCSV = document.getElementById("generateCSVButton");

      generateCSV.addEventListener("click", function () {
        let startDate = document.getElementById("startDate").value;
        let endDate = document.getElementById("endDate").value;
  
        console.log({ startDate, endDate });
  
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            args: [startDate, endDate],
            function: generateCSVFile
          });
        });
      });
    }
  
    if (document.getElementById("importCSV")) {
      const importCSV = document.getElementById("importCSV");

      importCSV.addEventListener("click", function () {
        chrome.tabs.create({
          url: "https://calendar.google.com/calendar/u/0/r/settings/export",
        });
      });
    }
  
    if (document.getElementById("deleteEvents")){
      const deleteEvents = document.getElementById("deleteEvents");

      deleteEvents.addEventListener("click", function () {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];
      
          if (tab.url.includes("https://calendar.google.com/calendar/u/" && "/r/agenda") === false) {
            alert("Please go to your calendar schedules https://calendar.google.com/calendar/");

            chrome.tabs.update({
              url: "https://calendar.google.com/calendar/u/0/r/agenda",
            });
          } else {
            // Create an alert confirmation with yes or no user response
            const userResponse = confirm(
              "Are you sure that all events are from `.csv` file processed by NEUSCHED?"
            );
      
            if (userResponse) {
              chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: deleteAllEventsFromCSV,
              });
            }
          }
        });
      });
    }
});

