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
          url: "http://student.neu.edu.ph" //subject to change due to current state of automate
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
        url: "http://student.neu.edu.ph/PARENTS_STUDENTS/enrollment/schedule.jsp", //subject to change due to current state of automate
      });
    });
  }

  let parsedData; // Variable to hold the parsed data

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.parsedData) {
      parsedData = request.parsedData; // Store the parsed data
    }
  });

  const editSchedule = document.getElementById("editScheduleButton");

  if (editSchedule) {
    editSchedule.addEventListener("click", function () {
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: parseToManualInput
        });
      });

      // Wait for the parsedData to be available
      setTimeout(() => {
        alert("Redirecting to manual input process . . .");
        if (parsedData) {
          const dataString = btoa(JSON.stringify(parsedData)); // Encode in Base64
          chrome.tabs.update({
            url: `https://froilandelfinjr.github.io/manual_input/?data=${encodeURIComponent(dataString)}`,
          });
        }

        const manualInput = "/panels/manualSchedPanel.html";
    
        chrome.sidePanel.setOptions({ path: manualInput });
      }, 1000); // Adjust timeout as needed
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

  if (document.getElementById("deleteSelected")){
    const deleteEvents = document.getElementById("deleteSelected");

    deleteEvents.addEventListener("click", function () {

      let startDate = document.getElementById("startDate").value;
      let endDate = document.getElementById("endDate").value;

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
    
        if (tab.url.includes("https://calendar.google.com/calendar/u/" && "/r/agenda") === false) {
          alert("- Please go to your Google calendar schedules.\n- Then select STARTING and ENDING date of the events to be deleted.");

          chrome.tabs.update({
            url: "https://calendar.google.com/calendar/u/0/r/agenda",
          });
        } else {
          // Create an alert confirmation with yes or no user response
          const userResponse = confirm(
            "Are you sure that all events in the schedule view are from the CSV file processed by NEUSCHED?"
          );
    
          if (userResponse) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              args: [startDate, endDate],
              function: deleteSelectedEvents,
            });
          }
        }
      });
    });
  }

  if (document.getElementById("deleteAll")){
    const deleteEvents = document.getElementById("deleteAll");

    deleteEvents.addEventListener("click", function () {

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
    
        if (tab.url.includes("https://calendar.google.com/calendar/u/" && "/r/agenda") === false) {
          alert("Please go to your Google calendar schedules https://calendar.google.com/calendar/");

          chrome.tabs.update({
            url: "https://calendar.google.com/calendar/u/0/r/agenda",
          });
        } else {
          // Create an alert confirmation with yes or no user response
          const userResponse = confirm(
            "Are you sure that all events in the schedule view are from the CSV file processed by NEUSCHED?"
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

