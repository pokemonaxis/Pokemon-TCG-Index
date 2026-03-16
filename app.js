const app = {
    data: {
        decks: JSON.parse(localStorage.getItem('axisDecks')) || [],
        matches: JSON.parse(localStorage.getItem('axisMatches')) || []
    },

    init() {
        this.bindEvents();
        this.renderDecks();
        this.updateDashboard();
        this.updateHistoryTable();
    },

    bindEvents() {
        document.getElementById('deck-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addDeck();
        });

        document.getElementById('match-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMatch();
        });
    },

    showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        
        if (viewId === 'dashboard') this.updateDashboard();
        if (viewId === 'add-match') this.populateDeckSelect();
        if (viewId === 'history') this.updateHistoryTable();
    },

    saveData() {
        localStorage.setItem('axisDecks', JSON.stringify(this.data.decks));
        localStorage.setItem('axisMatches', JSON.stringify(this.data.matches));
    },

    // --- Deck Logic ---
    addDeck() {
        const nameInput = document.getElementById('new-deck-name');
        const deck = {
            id: Date.now().toString(),
            name: nameInput.value.trim()
        };
        
        this.data.decks.push(deck);
        this.saveData();
        nameInput.value = '';
        this.renderDecks();
    },

    renderDecks() {
        const container = document.getElementById('decks-list');
        container.innerHTML = '';
        
        if (this.data.decks.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; font-size: 0.875rem;">No tienes mazos registrados.</p>';
            return;
        }

        this.data.decks.forEach(deck => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `<strong>${deck.name}</strong>`;
            container.appendChild(div);
        });
    },

    populateDeckSelect() {
        const select = document.getElementById('my-deck');
        select.innerHTML = '<option value="">Selecciona un mazo...</option>';
        this.data.decks.forEach(deck => {
            select.innerHTML += `<option value="${deck.name}">${deck.name}</option>`;
        });
    },

    // --- Match Logic ---
    calculateGlobalResult(sequence, format) {
        const seq = sequence.toUpperCase();
        if (format === 'BO1') return seq[0];
        
        const wins = (seq.match(/W/g) || []).length;
        const losses = (seq.match(/L/g) || []).length;
        
        if (wins === 2) return 'W';
        if (losses === 2) return 'L';
        if (wins > losses && seq.length === 3) return 'W';
        if (losses > wins && seq.length === 3) return 'L';
        return 'T';
    },

    addMatch() {
        const deckSelect = document.getElementById('my-deck');
        if (!deckSelect.value) {
            alert('Por favor, registra y selecciona un mazo primero.');
            return;
        }

        const sequenceInput = document.getElementById('match-results');
        const format = document.getElementById('format').value;
        const sequence = sequenceInput.value.toUpperCase();
        
        const matchData = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            myDeck: deckSelect.value,
            oppDeck: document.getElementById('opp-deck').value.trim(),
            format: format,
            sequence: sequence,
            globalResult: this.calculateGlobalResult(sequence, format)
        };

        this.data.matches.push(matchData);
        this.saveData();
        
        document.getElementById('match-form').reset();
        this.showView('history');
    },

    // --- Statistics & History ---
    updateDashboard() {
        document.getElementById('total-matches').innerText = this.data.matches.length;
        if (this.data.matches.length === 0) {
            document.getElementById('global-winrate').innerText = '0%';
            return;
        }
        const wins = this.data.matches.filter(m => m.globalResult === 'W').length;
        const winrate = (wins / this.data.matches.length) * 100;
        document.getElementById('global-winrate').innerText = winrate.toFixed(1) + '%';
    },

    updateHistoryTable() {
        const tbody = document.getElementById('history-body');
        tbody.innerHTML = '';
        
        const sorted = [...this.data.matches].sort((a, b) => b.id - a.id);
        
        sorted.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${m.date}</td>
                <td>${m.myDeck}</td>
                <td>${m.oppDeck}</td>
                <td>${m.format}</td>
                <td><span class="badge ${m.globalResult}">${m.globalResult}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
};

// Start application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => app.init());
