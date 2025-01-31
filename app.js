// Configuration
const API_KEY = 'VOTRE_CLE_API_JSONBIN'; // À remplacer
const BIN_IDS = {
  calendar: 'ID_BIN_CALENDRIER',
  tasks: 'ID_BIN_TACHES',
  shopping: 'ID_BIN_COURSES'
};

// Initialisation calendrier
const calendar = new toastui.Calendar('#calendar', {
  defaultView: 'month',
  isReadOnly: false,
  usageStatistics: false
});

// Charger les données
async function loadData(binId) {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Master-Key': API_KEY }
  });
  return response.json();
}

// Mise à jour interface
async function init() {
  try {
    // Calendrier
    const calendarData = await loadData(BIN_IDS.calendar);
    calendar.createEvents(calendarData.record.events || []);
    
    // Listes
    ['tasks', 'shopping'].forEach(async (type) => {
      const data = await loadData(BIN_IDS[type]);
      const container = document.getElementById(type);
      container.innerHTML = `
        <input type="text" class="new-item">
        <button onclick="addItem('${type}')">Ajouter</button>
        <ul>${(data.record.items || []).map(item => `<li>${item}</li>`).join('')}</ul>
      `;
    });
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Démarrer l'application
init();
