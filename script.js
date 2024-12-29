import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Initialisation Firebase
const db = getDatabase();

// Variables globales
const dates = document.getElementById("dates");
const monthYear = document.getElementById("currentMonthYear");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close");
const appointmentInput = document.getElementById("appointment");
const saveButton = document.getElementById("save");
const resetButton = document.getElementById("reset");
let currentDate = new Date();
let appointments = {};

// Référence Firebase
const appointmentsRef = ref(db, "appointments");

// Fonction pour afficher le calendrier
function renderCalendar() {
  dates.innerHTML = "";
  monthYear.textContent = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  for (let i = 1; i < (firstDay || 7); i++) dates.innerHTML += `<div></div>`;
  for (let day = 1; day <= lastDate; day++) {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${day}`;
    const hasAppointment = appointments[dateKey] ? "style='background:#ffedcc;'" : "";
    dates.innerHTML += `<div ${hasAppointment} data-date="${dateKey}">${day}</div>`;
  }

  document.querySelectorAll("#dates div").forEach(date =>
    date.addEventListener("click", e => openModal(e.target.dataset.date))
  );
}

// Fonction pour ouvrir la modale
function openModal(date) {
  if (!date) return;
  modal.style.display = "flex";
  modal.dataset.date = date; // Enregistre la date dans la modale
  document.getElementById("selectedDate").textContent = `Date sélectionnée : ${date}`;
  appointmentInput.value = appointments[date] || "";
}

// Fonction pour sauvegarder un rendez-vous
function saveAppointment(date, text) {
  const appointmentRef = ref(db, `appointments/${date}`);
  set(appointmentRef, text || null); // Supprime si texte vide
}

// Synchronisation en temps réel avec Firebase
onValue(appointmentsRef, (snapshot) => {
  appointments = snapshot.val() || {};
  renderCalendar();
});

// Gestion du clic sur le bouton "Enregistrer"
saveButton.onclick = () => {
  const date = modal.dataset.date;
  const text = appointmentInput.value.trim();
  saveAppointment(date, text);
  modal.style.display = "none";
};

// Gestion du clic sur le bouton "Réinitialiser"
resetButton.onclick = () => {
  if (confirm("Voulez-vous vraiment tout réinitialiser ?")) {
    set(appointmentsRef, null); // Supprime tous les rendez-vous
  }
};

// Gestion du clic pour fermer la modale
closeModal.onclick = () => {
  modal.style.display = "none";
};

// Navigation entre les mois
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
