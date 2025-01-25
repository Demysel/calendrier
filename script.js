const JSONBIN_API_KEY = '$2a$10$j99ZptquF7iTqI/UP0xQMucBLqWZW/8bTlz859GxEqzmmfq0DpR4.';
const JSONBIN_BIN_ID = '6794ec2de41b4d34e47e7ce5';

let currentDate = new Date();
let selectedEvent = null;
let currentTheme = localStorage.getItem('theme') || 'light';

// Configuration CORS pour JSONBin.io
const corsHeaders = {
  'Content-Type': 'application/json',
  'X-Master-Key': '$$2a$10$j99ZptquF7iTqI/UP0xQMucBLqWZW/8bTlz859GxEqzmmfq0DpR4.',
  'Access-Control-Allow-Origin': 'https://dreamy-dolphin-b8aa6f.netlify.app'
};

async function loadEvents() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/6794ec2de41b4d34e47e7ce5/latest`, {
      headers: corsHeaders
    });
    const data = await response.json();
    return data.record.events || [];
  } catch (error) {
    console.error('Erreur de chargement:', error);
    return [];
  }
}

// Dans script.js
async function saveEvents(events) {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
        'X-Bin-Private': 'true' // Ajout crucial
      },
      body: JSON.stringify({ events })
    });

    if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Échec de la sauvegarde:', error);
    alert('Impossible de sauvegarder - Vérifiez la console');
  }
}

// Génération du calendrier
function generateCalendar(date) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  
  document.getElementById('monthYear').textContent = 
    `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  document.querySelectorAll('.event').forEach(event => {
    event.style.backgroundColor = getComputedStyle(event).backgroundColor;

  // Remplissage des jours
  for (let i = 0; i < 42; i++) {
    const day = document.createElement('div');
    day.className = 'day';
    
    const currentDay = new Date(monthStart);
    currentDay.setDate(i - startDay + 1);
    
    if (i >= startDay && currentDay <= monthEnd) {
      day.textContent = currentDay.getDate();
      day.dataset.date = currentDay.toISOString().split('T')[0];
      day.ondblclick = () => openModal(null, currentDay);
    }
    
    calendar.appendChild(day);
  }
  
  loadEvents().then(events => {
    events.forEach(event => {
      const day = document.querySelector(`[data-date="${event.date.split('T')[0]}"]`);
      if (day) {
        const eventElement = createEventElement(event);
        day.appendChild(eventElement);
      }
    });
  });
}
}

function createEventElement(event) {
  const element = document.createElement('div');
  element.className = `event ${event.type}`;
  element.textContent = `${event.title}\n${event.date.split('T')[1].slice(0,5)}`;
  element.onclick = () => openModal(event);
  return element;
}

// Gestion du modal
const modal = document.getElementById('modal');
const form = document.getElementById('eventForm');

function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.getElementById('themeToggle').textContent = currentTheme === 'dark' ? '🌞' : '🌙';
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', currentTheme);
  applyTheme();
}

function openModal(event, date) {
  selectedEvent = event;
  
  if (event) {
    document.getElementById('title').value = event.title;
    document.getElementById('type').value = event.type;
    document.getElementById('date').value = event.date.slice(0,16);
    document.getElementById('location').value = event.location;
    document.getElementById('delete').style.display = 'inline';
  } else {
    form.reset();
    document.getElementById('date').value = date.toISOString().slice(0,16);
    document.getElementById('delete').style.display = 'none';
  }
  
  modal.style.display = 'block';
}

form.onsubmit = async (e) => {
  e.preventDefault();
  
  const events = await loadEvents();
  const eventData = {
    title: document.getElementById('title').value,
    type: document.getElementById('type').value,
    date: document.getElementById('date').value,
    location: document.getElementById('location').value
  };
  
  if (selectedEvent) {
    const index = events.findIndex(e => e.date === selectedEvent.date);
    events[index] = eventData;
  } else {
    events.push(eventData);
  }
  
  await saveEvents(events);
  modal.style.display = 'none';
  generateCalendar(currentDate);
};

document.getElementById('delete').onclick = async () => {
  const events = await loadEvents();
  const filtered = events.filter(e => e.date !== selectedEvent.date);
  await saveEvents(filtered);
  modal.style.display = 'none';
  generateCalendar(currentDate);
};

applyTheme();
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
// Navigation
document.getElementById('prev').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar(currentDate);
};

document.getElementById('next').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar(currentDate);
};

// Initialisation
 document.querySelectorAll('.event').forEach(event => {
    event.style.backgroundColor = getComputedStyle(event).backgroundColor;
  });
generateCalendar(currentDate);
