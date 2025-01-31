// Configuration
const API_KEY = '$2a$10$j99ZptquF7iTqI/UP0xQMucBLqWZW/8bTlz859GxEqzmmfq0DpR4.'; // Remplacer par votre clé
const BIN_IDS = {
  calendar: '679b8a1bad19ca34f8f6fdc5', // Remplacer par vos IDs
  tasks: '679b8a37ad19ca34f8f6fdce',
  shopping: '679b8a65ad19ca34f8f6fded'
};

// Initialisation calendrier
const calendar = new toastui.Calendar('#calendar', {
  defaultView: 'month',
  useFormPopup: true,
  isReadOnly: false
});

// Fonction d'ajout d'éléments
window.addItem = async (type) => {
  const input = document.querySelector(`#${type} .new-item`);
  const items = [...document.querySelectorAll(`#${type} li`)].map(li => li.textContent);
  
  await fetch(`https://api.jsonbin.io/v3/b/${BIN_IDS[type]}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': API_KEY
    },
    body: JSON.stringify({ items: [...items, input.value] })
  });
  
  input.value = '';
  init();
};

// Chargement des données
async function loadData(binId) {
  const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    headers: { 'X-Master-Key': API_KEY }
  });
  return response.json();
}

// Initialisation
async function init() {
  try {
    const calendarData = await loadData(BIN_IDS.calendar);
    calendar.createEvents(calendarData.record.events || []);
    
    for (const type of ['tasks', 'shopping']) {
      const data = await loadData(BIN_IDS[type]);
      const container = document.getElementById(type);
      container.innerHTML = `
        <input type="text" class="new-item">
        <button onclick="addItem('${type}')">Ajouter</button>
        <ul>${(data.record.items || []).map(item => `<li>${item}</li>`).join('')}</ul>
      `;
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

init();
