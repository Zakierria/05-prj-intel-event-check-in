const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCount = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const attendeeList = document.getElementById("attendeeList");

const storageKey = "intelEventCheckInData";
const maxCount = 50;
const teamNames = {
  water: "Team Water Wise",
  zero: "Team Net Zero",
  power: "Team Renewables",
};

let count = 0;
let attendeeRecords = [];

function saveCounts() {
  const state = {
    count: count,
    water: parseInt(document.getElementById("waterCount").textContent, 10),
    zero: parseInt(document.getElementById("zeroCount").textContent, 10),
    power: parseInt(document.getElementById("powerCount").textContent, 10),
    attendees: attendeeRecords,
  };

  localStorage.setItem(storageKey, JSON.stringify(state));
}

function renderAttendeeList() {
  attendeeList.innerHTML = "";

  if (attendeeRecords.length === 0) {
    const emptyRow = document.createElement("li");
    emptyRow.className = "attendee-empty";
    emptyRow.textContent = "No attendees checked in yet.";
    attendeeList.appendChild(emptyRow);
    return;
  }

  attendeeRecords.forEach(function (person) {
    const item = document.createElement("li");
    item.className = "attendee-item";

    const name = document.createElement("span");
    name.className = "attendee-name";
    name.textContent = person.name;

    const team = document.createElement("span");
    team.className = "attendee-team";
    team.textContent = person.team;

    item.appendChild(name);
    item.appendChild(team);
    attendeeList.appendChild(item);
  });
}

function loadCounts() {
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      count = Number(parsedData.count) || 0;
      attendeeRecords = Array.isArray(parsedData.attendees)
        ? parsedData.attendees
        : [];

      for (const team in teamNames) {
        const teamCounter = document.getElementById(team + "Count");
        const savedCount = Number(parsedData[team]) || 0;
        teamCounter.textContent = savedCount;
      }

      attendeeCount.textContent = count;
      const percentage = Math.round((count / maxCount) * 100);
      progressBar.style.width = `${percentage}%`;
      renderAttendeeList();
    } catch (error) {
      console.log("Unable to load saved attendance data.");
    }
  } else {
    renderAttendeeList();
  }
}

function findWinningTeam() {
  let winningTeam = "";
  let winningCount = -1;

  for (const team in teamNames) {
    const teamCounter = document.getElementById(team + "Count");
    const teamTotal = parseInt(teamCounter.textContent, 10);

    if (teamTotal > winningCount) {
      winningCount = teamTotal;
      winningTeam = teamNames[team];
    }
  }

  return winningTeam;
}

loadCounts();

// handles form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // get form values
  const name = nameInput.value.trim();
  const team = teamSelect.value;
  const teamName = teamSelect.options[teamSelect.selectedIndex].text;

  // increment count
  count++;

  // calculate progress percentage
  const percentage = Math.round((count / maxCount) * 100);

  // update attendee total and progress bar
  attendeeCount.textContent = count;
  progressBar.style.width = `${percentage}%`;

  // update team counter and attendee list
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent, 10) + 1;

  attendeeRecords.push({
    name: name,
    team: teamName,
  });

  // save updated values
  saveCounts();
  renderAttendeeList();

  // show success message
  if (count >= maxCount) {
    const winner = findWinningTeam();
    greeting.textContent = `🎉 Goal reached! ${winner} wins the celebration!`;
  } else {
    const greetingMessage = `Welcome ${name}! You are checked in for ${teamName}.`;
    greeting.textContent = greetingMessage;
  }

  greeting.classList.add("success-message");
  greeting.style.display = "block";

  // reset form after submission
  form.reset();
});
