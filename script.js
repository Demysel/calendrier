import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, push } from "firebase/database";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAU19mm6RDWy_fhoMo3SLWFuyvT4UDKKKk",
  authDomain: "calendrier-300cb.firebaseapp.com",
  projectId: "calendrier-300cb",
  storageBucket: "calendrier-300cb.appspot.com",
  messagingSenderId: "556904721649",
  appId: "1:556904721649:web:8d40a30990520e4ffbcd50",
  measurementId: "G-9G8217QW9D",
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Variables globales
const dates = document.getElementById("dates");
const monthYear = document.getElementById("currentMonthYear");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close");
const appointmentInput = document.getElementById("appointment");
const saveButton = document.getElementById("save");
const darkModeToggle = document.getElementById("darkModeToggle");
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
    const hasAppointment = appointments[dateKey]?.length ? "style='background:#ffedcc;'" : "";
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
  modal.dataset.date = date;
  document.getElementById("selectedDate").textContent = `Date sélectionnée : ${date}`;
  appointmentInput.value = "";
}

// Fonction pour sauvegarder un rendez-vous
function saveAppointment(date, text) {
  const appointmentRef = ref(db, `appointments/${date}`);
  push(appointmentRef, text).then(() => {
    modal.style.display = "none";
  });
}

// Synchronisation en temps réel avec Firebase
onValue(appointmentsRef, (snapshot) => {
  appointments = snapshot.val() || {};
  renderCalendar();
});

// Gestion du mode sombre
darkModeToggle.onclick = () => {
  document.body.classList.toggle("dark-mode");
};

// Gestion du clic sur le bouton "Enregistrer"
saveButton.onclick = () => {
  const date = modal.dataset.date;
  const text = appointmentInput.value.trim();
  if (text) saveAppointment(date, text);
};

// Réinitialisation des rendez-vous
resetButton.onclick = () => {
  set(appointmentsRef, null);
};

// Fermer la modale
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
