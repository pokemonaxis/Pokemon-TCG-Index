/**
 * PTCG Pro Tracker - Core Engine
 * Basado en arquitectura modular para alto rendimiento en dispositivos móviles.
 */

const app = {
    state: {
        decks: [],
        meta: [],
        currentDeckId: null,
        archetypes: [ // Default fallback
            { name: 'Charizard ex', id: 'charizard' },
            { name: 'Lugia VSTAR', id: 'lugia' },
            { name: 'Miraidon ex', id: 'miraidon' },
            { name: 'Gardevoir ex', id: 'gardevoir' },
            { name: 'Chien-Pao ex', id: 'chien-pao' }
        ]
    },

    init() {
        this.loadData();
        this.renderDeckList();
        this.populateSelects();
        this.initPWA();
    },

    loadData() {
        const saved = localStorage.getItem('ptcg_data');
        if (saved) {
            const data = JSON.parse(saved);
            this.state.decks = data.decks || [];
            this.state.meta = data.meta || this.state.archetypes;
        }
    },

    save() {
        localStorage.setItem('ptcg_data', JSON.stringify({
            decks: this.state.decks,
            meta: this.state.meta
        }));
    },

    // --- NAVIGATION ---
    nav(sectionId) {
        document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
        if(sectionId === 'sec-home') this.renderDeckList();
    },

    // --- DECK MANAGEMENT ---
    saveDeck() {
        const name = document.getElementById('deck-name').value;
        const arch = document.getElementById('deck-archetype').value;
        if (!name) return alert("Ponle un nombre a tu mazo.");

        const newDeck = {
            id: Date.now(),
            name: name,
            archetype: arch,
            matches: [],
            sprite: this.getSpriteUrl(arch)
        };

        this.state.decks.push(newDeck);
        this.save();
        this.nav('sec-home');
    },

    renderDeckList() {
        const container = document.getElementById('deck-list');
        container.innerHTML = this.state.decks.map(deck => {
            const wr = this.calculateWinrate(deck.matches);
            return `
                <div class="deck-card" onclick="app.viewDeck(${deck.id})">
                    <img src="${deck.sprite}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">
                    <div class="deck-info">
                        <h4>${deck.name}</h4>
                        <p>${deck.archetype}</p>
                        <span class="winrate-badge" style="background:${wr > 50 ? 'var(--win)' : 'var(--loss)'}">${wr}% WR</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    viewDeck(id) {
        this.state.currentDeckId = id;
        const deck = this.state.decks.find(d => d.id === id);
        this.renderDeckDashboard(deck);
        this.nav('sec-deck-detail');
    },

    renderDeckDashboard(deck) {
        const header = document.getElementById('deck-stats-header');
        header.innerHTML = `
            <div style="text-align:center; padding: 1rem;">
                <img src="${deck.sprite}" style="width:120px">
                <h2>${deck.name}</h2>
                <p>${deck.matches.length} Partidas jugadas</p>
            </div>
        `;
        this.renderMatches(deck.matches);
    },

    // --- MATCH LOGIC ---
    openMatchModal() { document.getElementById('match-modal').style.display = 'flex'; },
    closeModal() { document.getElementById('match-modal').style.display = 'none'; },

    setMatchResult(res, score) {
        const opp = document.getElementById('opp-archetype').value;
        const deck = this.state.decks.find(d => d.id === this.state.currentDeckId);
        
        deck.matches.unshift({
            id: Date.now(),
            opponent: opp,
            result: res,
            score: score,
            sprite: this.getSpriteUrl(opp)
        });

        this.save();
        this.closeModal();
        this.renderDeckDashboard(deck);
    },

    renderMatches(matches) {
        const container = document.getElementById('match-history');
        container.innerHTML = matches.map(m => `
            <div class="match-card ${m.result}">
                <div style="display:flex; align-items:center; gap:10px">
                    <img src="${m.sprite}" width="30">
                    <div>
                        <strong>vs ${m.opponent}</strong>
                        <div style="font-size:0.7rem; color:#94a3b8">${m.score}</div>
                    </div>
                </div>
                <div style="color:${m.result === 'W' ? 'var(--win)' : 'var(--loss)'}">${m.result}</div>
            </div>
        `).join('');
    },

    // --- HELPERS ---
    calculateWinrate(matches) {
        if (matches.length === 0) return 0;
        const wins = matches.filter(m => m.result === 'W').length;
        return ((wins / matches.length) * 100).toFixed(1);
    },

    getSpriteUrl(name) {
        // Lógica simple de detección de ID para PokéAPI
        const map = { 'charizard': 6, 'lugia': 249, 'miraidon': 1008, 'gardevoir': 282, 'chien-pao': 980 };
        const id = map[name.toLowerCase().split(' ')[0]] || 25; // Default Pikachu
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    },

    populateSelects() {
        const html = this.state.meta.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
        document.getElementById('deck-archetype').innerHTML = html;
        document.getElementById('opp-archetype').innerHTML = html;
    },

    async syncMeta() {
        const btn = document.getElementById('sync-btn');
        btn.innerText = "⏳ Sincronizando...";
        // Nota: En producción real, esto consultaría un endpoint que haga scraping de Limitless.
        // Aquí simulamos la actualización exitosa.
        setTimeout(() => {
            btn.innerText = "✅ Actualizado";
            setTimeout(() => btn.innerText = "🔄 Actualizar Meta", 2000);
        }, 1500);
    },

    initPWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js');
        }
    }
};

window.onload = () => app.init();