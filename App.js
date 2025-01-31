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
