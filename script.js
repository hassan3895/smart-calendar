const calendarDays = document.getElementById("calendarDays");
const monthYear = document.getElementById("monthYear");
const yearSelect = document.getElementById("yearSelect");
const addEventBtn = document.getElementById("addEventBtn");
const eventPopup = document.getElementById("eventPopup");
const closePopup = document.getElementById("closePopup");
const saveEvent = document.getElementById("saveEvent");

const eventTitle = document.getElementById("eventTitle");
const eventStart = document.getElementById("eventStart");
const eventEnd = document.getElementById("eventEnd");
const popupTitle = document.getElementById("popupTitle");

const eventList = document.getElementById("eventList");

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;
let editingIndex = -1;

let events = JSON.parse(localStorage.getItem("calendarEvents") || "[]");

// Ringtone audio setup
const ringtone = new Audio("ringtone.mp3");
ringtone.loop = false;

function generateYearOptions() {
  for (let year = 1900; year <= 2125; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    yearSelect.appendChild(option);
  }
}

function generateCalendar(month, year) {
  calendarDays.innerHTML = "";
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  monthYear.textContent = `${["January","February","March","April","May","June","July","August","September","October","November","December"][month]} ${year}`;

  for (let i = 0; i < firstDay; i++) {
    calendarDays.innerHTML += `<div></div>`;
  }

  for (let day = 1; day <= lastDate; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.textContent = day;

    const today = new Date();
    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayDiv.classList.add("today");
    }

    dayDiv.addEventListener("click", () => {
      const allDays = document.querySelectorAll(".days-grid div");
      allDays.forEach(d => d.classList.remove("selected"));
      dayDiv.classList.add("selected");

      selectedDate = new Date(year, month, day);
    });

    calendarDays.appendChild(dayDiv);
  }
}

function renderEventList() {
  eventList.innerHTML = "";
  events.forEach((event, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${event.title}</strong><br>
        ${event.start} to ${event.end}
      </div>
      <div>
        <button onclick="editEvent(${index})">Edit</button>
        <button onclick="deleteEvent(${index})">Delete</button>
      </div>
    `;
    eventList.appendChild(li);
  });
}

function editEvent(index) {
  const event = events[index];
  editingIndex = index;
  popupTitle.textContent = "Edit Event";
  eventTitle.value = event.title;
  eventStart.value = event.start;
  eventEnd.value = event.end;
  eventPopup.classList.remove("hidden");
}

function deleteEvent(index) {
  if (confirm("Are you sure you want to delete this event?")) {
    events.splice(index, 1);
    localStorage.setItem("calendarEvents", JSON.stringify(events));
    renderEventList();
  }
}

document.getElementById("prevBtn").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  yearSelect.value = currentYear;
  generateCalendar(currentMonth, currentYear);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  yearSelect.value = currentYear;
  generateCalendar(currentMonth, currentYear);
});

yearSelect.addEventListener("change", () => {
  currentYear = parseInt(yearSelect.value);
  generateCalendar(currentMonth, currentYear);
});

addEventBtn.addEventListener("click", () => {
  editingIndex = -1;
  popupTitle.textContent = "New Event";
  eventTitle.value = "";
  eventStart.value = "";
  eventEnd.value = "";
  if (selectedDate) {
    const iso = selectedDate.toISOString().split("T")[0];
    eventStart.value = `${iso}T12:00`;
    eventEnd.value = `${iso}T13:00`;
  }
  eventPopup.classList.remove("hidden");
});

closePopup.addEventListener("click", () => {
  eventPopup.classList.add("hidden");
});

saveEvent.addEventListener("click", () => {
  const title = eventTitle.value.trim();
  const start = eventStart.value;
  const end = eventEnd.value;

  if (!title || !start || !end) return alert("Please fill all fields.");

  const newEvent = { title, start, end };

  if (editingIndex > -1) {
    events[editingIndex] = newEvent;
  } else {
    events.push(newEvent);
  }

  localStorage.setItem("calendarEvents", JSON.stringify(events));
  renderEventList();
  eventPopup.classList.add("hidden");
});

// Check every second for event alarms
setInterval(() => {
  const now = new Date().toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  events.forEach(event => {
    if (event.start === now) {
      ringtone.play();
      alert(`🔔 Event Reminder: ${event.title}`);
    }
  });
}, 1000);

// INIT
generateYearOptions();
generateCalendar(currentMonth, currentYear);
renderEventList();
