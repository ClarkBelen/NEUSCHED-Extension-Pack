function generateCSVFile(selectedStartDate, selectedEndDate) {
  
  if (!selectedStartDate || !selectedEndDate) {
    alert("Please select a start and end date.");
    return;
  } else if (selectedStartDate > selectedEndDate) {
    alert(
      "Invalid duration. Please ensure selected start date is earlier than end date."
    );
    return;
  }

  // Select the table with the border attribute set to "1"
  let root = document.querySelector('table[border="1"]');

  // Get all the rows except the header row
  let rows = Array.from(root.querySelectorAll("tr")).slice(1);

  let data = rows.map(function (row) {
    let subjectCode = row.querySelector("td:nth-child(1)").innerText.trim();
    let subjectName = row.querySelector("td:nth-child(2)").innerText.trim();
    let scheduleText = row.querySelector("td:nth-child(3)").innerText.trim();
    let sectionRoomText = row.querySelector("td:nth-child(4)").innerText.trim();
    let lecLabUnits = row.querySelector("td:nth-child(5)").innerText.trim();
    let totalUnits = row.querySelector("td:nth-child(6)").innerText.trim();

    // Split schedules and section rooms by newline
    let uniqueSchedules = scheduleText.split("\n").map((s) => s.trim());
    let uniqueSectionRooms = sectionRoomText.split("\n").map((s) => s.trim());

    // Ensure both arrays have the same length by filling with empty strings if necessary
    while (uniqueSchedules.length < uniqueSectionRooms.length) {
      uniqueSchedules.push(uniqueSchedules[0]);
    }
    while (uniqueSectionRooms.length < uniqueSchedules.length) {
      uniqueSectionRooms.push(uniqueSectionRooms[0]);
    }

    // Map each schedule and section room to an object
    let schedulesAndRooms = uniqueSchedules.map((schedule, index) => {
      let sectionRoom = uniqueSectionRooms[index];

      let specialCases = [
        "MT",
        "MW",
        "MTH",
        "MF",
        "MSAT",
        "MSUN",
        "TW",
        "TTH",
        "TF",
        "TSAT",
        "TSUN",
        "WTH",
        "WF",
        "WSAT",
        "WSU",
        "THF",
        "ThSAT",
        "ThSUN",
        "FSAT",
        "FSUN",
        "SATSUN",
      ];

      // Special cases handling
      specialCases.forEach((dayCombo) => {
        let pattern = new RegExp("^" + dayCombo + "\\s+(.+)");
        let match = schedule.match(pattern);
        if (match) {
          let day1 = dayCombo.charAt(0);
          let day2 = dayCombo.slice(1);
          schedule = `${day1} ${match[1]},${day2} ${match[1]}`;
        }
      });

      return {
        subjectCode,
        subjectName,
        schedule,
        sectionRoom,
        lecLabUnits,
        totalUnits,
      };
    });

    // Return the array of objects
    return schedulesAndRooms;
  });

  // Flatten the array of arrays to a single array
  data = data.flat();

  // Now 'data' contains an array of objects with the course details
  console.log(data);

  // Get current date with day of week
  const days = ["SUN", "M", "T", "W", "TH", "F", "SAT"];
  const currentDate = new Date();
  const currentDay = days[currentDate.getDay()];
  const newStartDate = new Date(selectedStartDate);
  const newEndDate = new Date(selectedEndDate);
  const result = [];

  while (newStartDate <= newEndDate) {
    result.push({
      date: newStartDate.toISOString().slice(0, 10),
      day: days[newStartDate.getDay()],
    });
    newStartDate.setDate(newStartDate.getDate() + 1);
  }

  // If the start date is in the future, add missing days with the correct dates
  if (selectedStartDate > currentDate) {
    const missingDays = days
      .slice(days.indexOf(currentDay))
      .concat(days.slice(0, days.indexOf(currentDay)));
    const missingDates = missingDays.map((day, index) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + index + 1);
      return { date: date, day: day };
    });
    result.unshift(...missingDates);
  }

  // If the end date is in the future, add missing days with the correct dates
  if (selectedEndDate > currentDate) {
    const missingDays = days
      .slice(days.indexOf(currentDay) + 1)
      .concat(days.slice(0, days.indexOf(currentDay) + 1));
    const missingDates = missingDays.map((day, index) => {
      const date = new Date(selectedEndDate);
      date.setDate(date.getDate() + index + 1);
      return { date: date, day: day };
    });
    result.push(...missingDates);
  }

  let csvContent =
    "Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location,Private\r\n";

  // Assuming 'data' is an array of objects containing course details
  data.forEach((course) => {
    let subject = course.subjectName; // Use the subject name from the HTML structure
    let description = course.subjectCode + " | " + course.subjectName; 
    let schedule = course.schedule; // Use the schedule from the HTML structure
    console.log(schedule);
    let sectionRoom = course.sectionRoom; // Use the section and room from the HTML structure

    console.log(schedule);
    // Convert the schedule string into an array of schedules
    let classSchedules = schedule.split(",").map((s) => s.trim());

    // Iterate over each schedule
    classSchedules.forEach(function (cs) {
      // Extract the day, start time, and end time from the schedule string
      let [day, timeRange] = cs.split(" ");
      let [startTime, endTime] = timeRange.split("-");

      let start = startTime;
      let startAMPM = start.replace("AM", " AM").replace("PM", " PM");
      console.log(startAMPM);
      let end = endTime;
      let endAMPM = end
        .replace(/AM|PM/g, function (match) {
          return " " + match + " ";
        })
        .replace(/\(.*?\)/g, "")
        .trim();
      console.log(endAMPM);

      // Two-digit hours and minutes
      let startDate = new Date().toISOString().slice(0, 10);
      let endDate = new Date().toISOString().slice(0, 10);

      // Join the remaining details as the location
      let location = sectionRoom;
      
      let schedEmoji = "📅";

      result.forEach((r) => {
        if (r.day === day) {
          csvContent += `${schedEmoji} | ${subject} - NEUSCHED,${r.date},${startAMPM},${r.date},${endAMPM},FALSE,${description},${location},TRUE\r\n`;
        }
      });
    });
  });

  // Now 'csvContent' contains the CSV data
  
  var csv = document.createElement("a");
  csv.href = "data:text/csv;charset=utf-8," + encodeURI(csvContent);
  csv.target = "_blank";
  csv.download = "neuschedule_" + selectedStartDate + "-to-" + selectedEndDate + "_automate.csv";
  csv.click();
}

function parseToManualInput(){
      // Select the table with the border attribute set to "1"
      let root = document.querySelector('table[border="1"]');

      // Get all the rows except the header row
      let rows = Array.from(root.querySelectorAll("tr")).slice(1);
    
      let data = rows.map(function (row) {
        let subjectCode = row.querySelector("td:nth-child(1)").innerText.trim();
        let subjectName = row.querySelector("td:nth-child(2)").innerText.trim();
        let scheduleText = row.querySelector("td:nth-child(3)").innerText.trim();
        let sectionRoomText = row.querySelector("td:nth-child(4)").innerText.trim();
        let lecLabUnits = row.querySelector("td:nth-child(5)").innerText.trim();
        let totalUnits = row.querySelector("td:nth-child(6)").innerText.trim();
    
        // Split schedules and section rooms by newline
        let uniqueSchedules = scheduleText.split("\n").map((s) => s.trim());
        let uniqueSectionRooms = sectionRoomText.split("\n").map((s) => s.trim());
    
        // Ensure both arrays have the same length by filling with empty strings if necessary
        while (uniqueSchedules.length < uniqueSectionRooms.length) {
          uniqueSchedules.push(uniqueSchedules[0]);
        }
        while (uniqueSectionRooms.length < uniqueSchedules.length) {
          uniqueSectionRooms.push(uniqueSectionRooms[0]);
        }
    
        // Map each schedule and section room to an object
        let schedulesAndRooms = uniqueSchedules.map((schedule, index) => {
          let sectionRoom = uniqueSectionRooms[index];
    
          let specialCases = [
            "MT",
            "MW",
            "MTH",
            "MF",
            "MSAT",
            "MSUN",
            "TW",
            "TTH",
            "TF",
            "TSAT",
            "TSUN",
            "WTH",
            "WF",
            "WSAT",
            "WSU",
            "THF",
            "ThSAT",
            "ThSUN",
            "FSAT",
            "FSUN",
            "SATSUN",
          ];
    
          // Special cases handling
          specialCases.forEach((dayCombo) => {
            let pattern = new RegExp("^" + dayCombo + "\\s+(.+)");
            let match = schedule.match(pattern);
            if (match) {
              let day1 = dayCombo.charAt(0);
              let day2 = dayCombo.slice(1);
              schedule = `${day1} ${match[1]},${day2} ${match[1]}`;
            }
          });
    
          return {
            subjectCode,
            subjectName,
            schedule,
            sectionRoom,
            lecLabUnits,
            totalUnits,
          };
        });
    
        // Return the array of objects
        return schedulesAndRooms;
      });
    
      // Flatten the array of arrays to a single array
      data = data.flat();
    
      // Now 'data' contains an array of objects with the course details
      console.log(data);
      // After parsing the data, send it back to the popup script
      chrome.runtime.sendMessage({ parsedData: data });
}

function deleteSelectedEvents(startDate, endDate) {
  
  if (!startDate || !endDate) {
    alert("Please select a valid start and end date.");
    return;
  } else if (startDate > endDate) {
    alert(
      "Invalid duration. Please ensure selected start date is earlier than end date."
    );
    return;
  }

  const elements = document.querySelectorAll('[jsname="Fa5oWb"]');

  var classEventsElements = [];

  // Ensure startDate and endDate are Date objects and set their time to the start of the day
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  elements.forEach((element) => {
    console.log(element.innerText);
    if (element.innerText.includes("📅") || element.innerText.includes("NEUSCHED")) {
      const ariaLabel = element.querySelector('[role="button"]').getAttribute('aria-label');
      let dateCal = ariaLabel.split(",").map((s) => s.trim());
      const dateMatch = dateCal[4];
      console.log(dateMatch);
      if (dateMatch) {
        const eventDate = new Date(dateMatch);
        eventDate.setFullYear(dateCal[5]);
        // Set the time to the start of the day for fair comparison
        eventDate.setHours(0, 0, 0, 0);
        // Compare just the date parts
        if (eventDate >= start && eventDate <= end) {
          classEventsElements.push(element);
        }
      }
    }
  });

  if (classEventsElements.length === 0) {
    alert("All class events from " + startDate + " to " + endDate + " have been deleted.");
    return;
  }

  const element = classEventsElements[0];

  element.click();

  setTimeout(() => {
    const deleteElement = document.querySelector('[aria-label="Delete event"]');
    if (deleteElement) {
      deleteElement.click();
    }
    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    setTimeout(deleteSelectedEvents, 0.01 * 1000, startDate, endDate);
  }, 0.01 * 1000);
}

function deleteAllEventsFromCSV() {
const elements = document.querySelectorAll('[jsname="Fa5oWb"]');

var classEventsElements = [];

elements.forEach((element) => {
  console.log(element.innerText);
  if (element.innerText.includes("📅") || element.innerText.includes("NEUSCHED")) {
    classEventsElements.push(element);
  }
});

if (classEventsElements.length === 0) {
  alert("All class events have been deleted.");
  return; // Exit the function if there are no more elements to delete
}

const element = classEventsElements[0];

element.click();

// Wait for the modal to appear
setTimeout(() => {
  // Click the element with aria-label="Delete event"
  const deleteElement = document.querySelector('[aria-label="Delete event"]');
  if (deleteElement) {
    deleteElement.click();
  }
  // Simulate the escape key press to close the modal
  const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
  document.dispatchEvent(escapeEvent);

  // Call deleteElements function recursively after a delay
  setTimeout(deleteAllEventsFromCSV, 0.01 * 1000);
}, 0.01 * 1000); // Wait for 0.5 second before deleting the next element
}

