const calendar = new toastui.Calendar('#calendar', {
    defaultView: 'month',
    useFormPopup: true,
    useDetailPopup: true
});

// Configuration JSONBin.io
const API_KEY = 'TON_API_KEY';
const CALENDAR_BIN_ID = 'TON_BIN_ID';
const API_URL = `https://api.jsonbin.io/v3/b/${CALENDAR_BIN_ID}/latest`;

// Charger les événements
async function loadCalendar() {
    const response = await fetch(API_URL, {
        headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    calendar.createEvents(data.record.events);
}

// Sauvegarder les événements
async function saveCalendar(events) {
    await fetch(`https://api.jsonbin.io/v3/b/${CALENDAR_BIN_ID}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
        },
        body: JSON.stringify({ events })
    });
}
// Gestion des listes
async function manageList(binId, containerId) {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: { 'X-Master-Key': API_KEY }
    });
    const data = await response.json();
    
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <input type="text" class="new-item">
        <button class="add-btn">Ajouter</button>
        <ul>${data.record.items.map(item => `<li>${item}</li>`).join('')}</ul>
    `;

    container.querySelector('.add-btn').addEventListener('click', async () => {
        const newItem = container.querySelector('.new-item').value;
        const updatedItems = [...data.record.items, newItem];
        
        await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify({ items: updatedItems })
        });
        
        manageList(binId, containerId);
    });
}

// Initialisation
manageList(process.env.TASKS_BIN_ID, 'tasks');
manageList(process.env.SHOPPING_BIN_ID, 'shopping');

// Écouteurs d'événements
calendar.on('beforeCreateEvent', async (eventData) => {
    const event = {
        id: String(Date.now()),
        title: eventData.title,
        start: eventData.start,
        end: eventData.end,
        category: eventData.category
    };
    await saveCalendar([...calendar.getEvents(), event]);
});

loadCalendar();
