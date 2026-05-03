// DATOS HARDCODEADOS PARA EL PROTOTIPO
const books = [
    { id: 1, title: "El Misterio del León Dorado", author: "A. Sabueso", tags: ["Misterio", "Aventura"], difficulty: 4, rating: 4.8, cover: "🦁" },
    { id: 2, title: "Viaje al Centro de la Biblioteca", author: "J. Libro", tags: ["Aventura", "Fantasía"], difficulty: 3, rating: 4.5, cover: "📚" },
    { id: 3, title: "Robotín en el Espacio", author: "I. Asimovín", tags: ["Ciencia Ficción"], difficulty: 5, rating: 4.2, cover: "🤖" },
    { id: 4, title: "Historias de Terror Suave", author: "E. Poe", tags: ["Terror", "Misterio"], difficulty: 6, rating: 3.9, cover: "👻" },
    { id: 5, title: "Las Aventuras de Simba", author: "Rey León", tags: ["Aventura"], difficulty: 2, rating: 5.0, cover: "🐾" },
    { id: 6, title: "Matemáticas Divertidas", author: "P. Pitágoras", tags: ["Educativo"], difficulty: 4, rating: 4.0, cover: "➕" },
    { id: 7, title: "El Bosque Encantado", author: "Hada Madrina", tags: ["Fantasía"], difficulty: 3, rating: 4.7, cover: "🌳" },
    { id: 8, title: "Detectives de la Clase 5B", author: "L. Lupa", tags: ["Misterio"], difficulty: 4, rating: 4.4, cover: "🔍" },
];

const students = [
    { id: "AL001", name: "Simba Pérez", level: 5, preferences: ["Misterio", "Aventura"] },
    { id: "AL002", name: "Nala López", level: 4, preferences: ["Fantasía"] },
    { id: "AL003", name: "Mufasa Rey", level: 6, preferences: ["Misterio", "Ciencia Ficción"] },
];

let currentRole = null;
let activeFilters = [];

// Preferencias seleccionadas (compartidas para el prototipo)
let studentPreferences = {
    etiquetas: [],
    estructura: [],
    valores: []
};

// NAVEGACIÓN Y LOGIN
function showRoleSelection() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('role-view').classList.remove('hidden');
}

function backToLogin() {
    document.getElementById('role-view').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
}

function login(role) {
    currentRole = role;
    document.getElementById('role-view').classList.add('hidden');
    document.getElementById(`${role}-view`).classList.remove('hidden');
    
    const info = document.getElementById('user-info');
    info.classList.remove('hidden');
    const badge = document.getElementById('role-badge');
    badge.innerText = role;
    
    // Renderizar libros para cualquier rol
    renderBooks(role);

    if (role === 'profesor') renderProfessorView();
    if (role === 'familiar') renderFamiliarView();
}

function logout() {
    document.getElementById(`${currentRole}-view`).classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
    currentRole = null;
}

// LÓGICA DE ALUMNO (Y RECOMENDADOR GENERAL)
function renderBooks(role, filterTags = []) {
    const grid = document.getElementById(`${role}-book-grid`);
    if (!grid) return;
    grid.innerHTML = '';
    
    const filtered = books.filter(b => {
        // RESTRICCIÓN DE SISTEMA (Base de datos): No mostrar libros de religión
        if (b.tags.includes('Religión')) return false;

        // Filtro por etiquetas de preferencias
        if (filterTags.length > 0 && !b.tags.some(t => filterTags.includes(t))) return false;
        // Filtro por restricciones activas
        if (activeFilters.some(f => f.type === 'restriccion' && b.tags.includes(f.value))) return false;
        return true;
    });

    filtered.forEach(book => {
        const isRecommended = activeFilters.some(f => f.type === 'recomendacion' && book.tags.includes(f.value));
        const card = document.createElement('div');
        card.className = `card p-4 hover:shadow-xl transition-shadow cursor-pointer border-b-4 ${isRecommended ? 'border-success' : 'border-primary'}`;
        card.innerHTML = `
            ${isRecommended ? '<span class="text-[9px] bg-success text-white px-2 py-0.5 rounded-full absolute -top-2 left-2">RECOMENDADO</span>' : ''}
            <div class="text-6xl mb-4 text-center">${book.cover}</div>
            <h4 class="font-bold text-sm h-10 overflow-hidden">${book.title}</h4>
            <p class="text-xs text-gray-500">${book.author}</p>
            <div class="mt-2 flex justify-between items-center">
                <span class="text-xs font-bold text-accent">Niv. ${book.difficulty}</span>
                <span class="text-xs font-bold text-yellow-500">⭐ ${book.rating}</span>
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
                ${book.tags.map(t => `<span class="text-[10px] bg-bgLight px-1 rounded">${t}</span>`).join('')}
            </div>
        `;
        card.onclick = () => alert(`Has seleccionado: ${book.title}. ¡Buena lectura!`);
        grid.appendChild(card);
    });

    // Recomendación destacada (si existe el elemento)
    const topRec = document.getElementById('top-recommendation');
    if (topRec && filtered.length > 0) {
        topRec.innerHTML = `
            <div class="text-4xl mb-2">${filtered[0].cover}</div>
            <p class="font-bold text-primary">${filtered[0].title}</p>
            <p class="text-xs">¡Este libro te encantará!</p>
        `;
    }
}

function addPrefItem(category) {
    const select = document.getElementById(`${currentRole}-select-${category}`);
    const value = select.value;
    if (!value) return;

    if (!studentPreferences[category].includes(value)) {
        studentPreferences[category].push(value);
        renderPrefItems(category);
    }
    select.value = '';
}

function renderPrefItems(category) {
    const container = document.getElementById(`${currentRole}-list-${category}`);
    if (!container) return;
    container.innerHTML = '';

    studentPreferences[category].forEach((item, index) => {
        const tag = document.createElement('span');
        tag.className = 'bg-gray-200 bg-opacity-50 text-textDark text-[10px] px-2 py-1 rounded-full flex items-center space-x-1 border border-gray-300';
        tag.innerHTML = `
            <span>${item}</span>
            <button onclick="removePrefItem('${category}', ${index})" class="font-bold hover:text-error">×</button>
        `;
        container.appendChild(tag);
    });
}

function removePrefItem(category, index) {
    studentPreferences[category].splice(index, 1);
    renderPrefItems(category);
}

function updatePreferences() {
    // Combinamos todas las preferencias para el filtrado
    const allSelected = [
        ...studentPreferences.etiquetas,
        ...studentPreferences.estructura,
        ...studentPreferences.valores
    ];
    
    renderBooks(currentRole, allSelected);
}

// CHAT
function sendMessage() {
    sendMessageRole(currentRole);
}

function sendMessageRole(role) {
    const inputId = `${role}-chat-input`;
    const msgContainerId = `${role}-chat-messages`;
    
    const input = document.getElementById(inputId);
    const text = input.value.trim();
    if (!text) return;

    addMessageCustom(text, 'user', msgContainerId);
    input.value = '';

    // Simulación de IA
    setTimeout(() => {
        let response = "¡Qué interesante! Déjame buscar algo relacionado.";
        if (role === 'familiar') {
            response = "Entiendo tu preocupación. He ajustado los filtros para priorizar lecturas educativas este mes.";
            if (text.toLowerCase().includes('comprar') || text.toLowerCase().includes('sugiere')) {
                response = "Basado en el nivel de tu hijo, te sugiero 'El Misterio del León Dorado'. He actualizado la sección de sugerencias de compra.";
            }
        } else if (role === 'profesor') {
            response = "He ajustado los filtros de aula según tus indicaciones. Los alumnos verán recomendaciones alineadas con este tema.";
        } else {
            if (text.toLowerCase().includes('misterio')) {
                response = "He visto que te gusta el misterio. Te recomiendo 'El Misterio del León Dorado'. ¿Quieres que te cuente más?";
            } else if (text.toLowerCase().includes('recomienda')) {
                response = "Claro, basándome en tu nivel 5, 'Robotín en el Espacio' es un reto perfecto para ti.";
            }
        }
        addMessageCustom(response, 'ai', msgContainerId);
    }, 1000);
}

function addMessage(text, sender) {
    addMessageCustom(text, sender, `${currentRole}-chat-messages`);
}

function addMessageCustom(text, sender, containerId) {
    const chat = document.getElementById(containerId);
    if (!chat) return;
    const div = document.createElement('div');
    div.className = sender === 'ai' ? 'chat-bubble-ai p-3 max-w-[80%]' : 'chat-bubble-user p-3 max-w-[80%] self-end ml-auto';
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function simulateVoice() {
    addMessage("(Grabando voz... 🎤)", "user");
    setTimeout(() => {
        const voiceText = "Quiero leer algo de aventuras.";
        const inputId = `${currentRole}-chat-input`;
        document.getElementById(inputId).value = voiceText;
        sendMessage();
    }, 1500);
}

// LÓGICA DE PROFESOR
function renderProfessorView() {
    const list = document.getElementById('students-list');
    list.innerHTML = '';
    students.forEach(s => {
        const li = document.createElement('li');
        li.className = 'p-2 hover:bg-bgLight rounded cursor-pointer flex justify-between items-center';
        li.innerHTML = `<span>${s.name}</span> <span class="text-[10px] bg-accent text-white px-2 rounded-full">${s.id}</span>`;
        li.onclick = () => alert(`Viendo perfil de ${s.name}`);
        list.appendChild(li);
    });
    renderActiveFilters();
}

function addGlobalFilter(type) {
    const inputId = type === 'recomendacion' ? 'prof-rec-input' : 'prof-res-input';
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    if (!value) return;

    activeFilters.push({ type, value, author: 'Profesor' });
    input.value = '';
    renderActiveFilters();
    // Actualizar libros si estamos en vista profesor
    if (currentRole === 'profesor' || currentRole === 'alumno') {
        renderBooks(currentRole);
    }
}

function renderActiveFilters() {
    const container = document.getElementById('active-filters-prof');
    const containerFam = document.getElementById('active-filters-fam');
    if (container) container.innerHTML = '';
    if (containerFam) containerFam.innerHTML = '';

    activeFilters.forEach((f, index) => {
        const tag = document.createElement('span');
        // Colores translúcidos: Rojo para restricciones, Verde para recomendaciones
        const bgColor = f.type === 'recomendacion' ? 'rgba(56, 161, 105, 0.2)' : 'rgba(229, 62, 62, 0.2)';
        const borderColor = f.type === 'recomendacion' ? 'var(--success-green)' : 'var(--error-red)';

        tag.className = `text-black text-xs px-3 py-1 rounded-full flex items-center space-x-2 border`;
        tag.style.backgroundColor = bgColor;
        tag.style.borderColor = borderColor;

        tag.innerHTML = `
            <span class="font-medium">${f.author}: ${f.type === 'recomendacion' ? '⭐' : '🚫'} ${f.value}</span>
            <button onclick="removeFilter(${index})" class="font-bold hover:text-gray-700 ml-1">×</button>
        `;
        if (container) container.appendChild(tag.cloneNode(true));
        if (containerFam) containerFam.appendChild(tag.cloneNode(true));
    });
}

function removeFilter(index) {
    activeFilters.splice(index, 1);
    renderActiveFilters();
    renderBooks(currentRole);
}

// LÓGICA DE FAMILIAR
function renderFamiliarView() {
    const history = document.getElementById('reading-history');
    if (history) {
        history.innerHTML = '';
        const read = ["Las Aventuras de Simba", "Viaje al Centro de la Biblioteca", "Detectives de la Clase 5B"];
        read.forEach(title => {
            const li = document.createElement('li');
            li.innerText = `✅ ${title}`;
            history.appendChild(li);
        });
    }

    renderActiveFilters();
}

function addFamilyRestriction() {
    const input = document.getElementById('family-res-input');
    const value = input.value.trim();
    if (!value) return;

    activeFilters.push({ type: 'restriccion', value, author: 'Familiar' });
    input.value = '';
    renderActiveFilters();
    renderBooks(currentRole);
}
