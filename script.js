// Variables
const dates = document.getElementById("dates");
const monthYear = document.getElementById("currentMonthYear");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close");
const appointmentInput = document.getElementById("appointment");
const saveButton = document.getElementById("save");
const resetButton = document.getElementById("reset");
let currentDate = new Date();
let appointments = JSON.parse(localStorage.getItem("appointments")) || {};

// Rendu du calendrier
function renderCalendar() {
  dates.innerHTML = "";
  monthYear.textContent = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  for (let i = 1; i < (firstDay || 7); i++) {
    dates.innerHTML += `<div></div>`;
  }
  for (let day = 1; day <= lastDate; day++) {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
    const hasAppointment = appointments[dateKey] ? "style='background:#ffedcc;'" : "";
    dates.innerHTML += `<div ${hasAppointment} data-date="${dateKey}">${day}</div>`;
  }
  
  document.querySelectorAll("#dates div").forEach(date =>
    date.addEventListener("click", e => openModal(e.target.dataset.date))
  );
}

// Ouvrir la modale
function openModal(date) {
  if (!date) return;
  modal.style.display = "flex";
  document.getElementById("selectedDate").textContent = `Date sélectionnée : ${date}`;
  appointmentInput.value = appointments[date] || "";
  saveButton.onclick = () => saveAppointment(date);
}

// Sauvegarder un rendez-vous
function saveAppointment(date) {
  if (!date) return;
  const text = appointmentInput.value.trim();
  if (text) {
    appointments[date] = text;
  } else {
    delete appointments[date];
  }
  localStorage.setItem("appointments", JSON.stringify(appointments));
  modal.style.display = "none";
  renderCalendar();
}

// Réinitialiser les rendez-vous
resetButton.onclick = () => {
  if (confirm("Voulez-vous vraiment tout réinitialiser ?")) {
    appointments = {};
    localStorage.removeItem("appointments");
    renderCalendar();
  }
};

// Fermer la modale
closeModal.onclick = () => (modal.style.display = "none");

// Navigation du mois
document.getElementById("prev").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};

document.getElementById("next").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

// Initialisation
renderCalendar();
