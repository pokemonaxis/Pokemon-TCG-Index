// State Management
let matches = JSON.parse(localStorage.getItem('axisMatches')) || [];

// Navigation
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'dashboard') updateDashboard();
    if (viewId === 'history') updateHistoryTable();
}

// Logic: Calculate Global Result from Sequence
function calculateGlobalResult(sequence, format) {
    const seq = sequence.toUpperCase();
    if (format === 'BO1') {
        return seq[0]; // W, L, or T
    }
    
    // BO3 Logic
    const wins = (seq.match(/W/g) || []).length;
    const losses = (seq.match(/L/g) || []).length;
    
    if (wins === 2) return 'W';
    if (losses === 2) return 'L';
    if (wins > losses && seq.length === 3) return 'W'; // Time in game 3, player with more prizes wins
    if (losses > wins && seq.length === 3) return 'L';
    return 'T'; // WT, LT, or actual ties
}

// Form Submission
document.getElementById('match-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const sequence = document.getElementById('match-results').value.toUpperCase();
    const format = document.getElementById('format').value;
    const globalResult = calculateGlobalResult(sequence, format);

    const matchData = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        myDeck: document.getElementById('my-deck').value,
        oppDeck: document.getElementById('opp-deck').value,
        format: format,
        sequence: sequence,
        globalResult: globalResult
    };

    matches.push(matchData);
    localStorage.setItem('axisMatches', JSON.stringify(matches));
    
    this.reset();
    showView('history');
});

// Update Dashboard
function updateDashboard() {
    document.getElementById('total-matches').innerText = matches.length;
    
    if (matches.length === 0) {
        document.getElementById('global-winrate').innerText = '0%';
        return;
    }

    const wins = matches.filter(m => m.globalResult === 'W').length;
    const winrate = (wins / matches.length) * 100;
    
    document.getElementById('global-winrate').innerText = winrate.toFixed(1) + '%';
}

// Update History Table
function updateHistoryTable() {
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';

    // Sort descending by date/id
    const sortedMatches = [...matches].sort((a, b) => b.id - a.id);

    sortedMatches.forEach(match => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${match.date}</td>
            <td>${match.myDeck}</td>
            <td>${match.oppDeck}</td>
            <td>${match.format}</td>
            <td style="letter-spacing: 2px;">${match.sequence}</td>
            <td><span class="badge ${match.globalResult}">${match.globalResult}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize
updateDashboard();