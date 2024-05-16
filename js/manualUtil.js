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

 // Select the table by its ID
 let root = document.querySelector('#display table');

 // Get all the rows except the header row
 let rows = Array.from(root.querySelectorAll("tbody tr"));

 let data = rows.map(function (row) {
    let subjectCode = row.querySelector("td[data-name='sCode']").innerText.trim();
    let subjectName = row.querySelector("td[data-name='sName']").innerText.trim();
    let day = row.querySelector("td[data-name='schedDay']").innerText.trim();
    let startTime = row.querySelector("td[data-name='startTime']").innerText.trim();
    let endTime = row.querySelector("td[data-name='endTime']").innerText.trim();
    let description = row.querySelector("td[data-name='description']").innerText.trim();
    let location = row.querySelector("td[data-name='location']").innerText.trim();
    let isPrivate = row.querySelector("td[data-name='isPrivate']").innerText.trim();

    return {
      subjectCode,
      subjectName,
      day,
      startTime,
      endTime,
      description,
      location,
      isPrivate
    };
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
    let subject = course.subjectName;
    let description = course.subjectCode + " | " + course.subjectName + "  " + course.description; // Use the subject name from the HTML structure
    let daySchedule = course.day; // Use the schedule from the HTML structure
    let dayStart = course.startTime;
    let dayEnd = course.endTime;
    let location = course.location;
    let isAllDay = dayStart ? "FALSE" : "TRUE";
    let isPrivate = course.isPrivate;

    // Convert the schedule string into an array of schedules
    let daySchedules = daySchedule.split(",").map((s) => s.trim());

    // Iterate over each schedule
    daySchedules.forEach(function (ds) {
      let day = ds;
      console.log(day);

      // Two-digit hours and minutes
      let startDate = new Date().toISOString().slice(0, 10);
      let endDate = new Date().toISOString().slice(0, 10);

      let schedEmoji = "📅";

      result.forEach((r) => {
        if (r.day === day) {
          csvContent += `${schedEmoji} | ${subject} | NEUSCHED,${r.date},${dayStart},${r.date},${dayEnd},${isAllDay},${description},${location},${isPrivate}\r\n`;
        }
        console.log(csvContent);
      });
    });
  });

  // Create a hidden element to download the CSV file
 var csv = document.createElement("a");
 csv.href = "data:text/csv;charset=utf-8," + encodeURI(csvContent);
 csv.target = "_blank";
 csv.download = "neuschedule_" + selectedStartDate + "-to-" + selectedEndDate + "_manual.csv";
 csv.click();

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




