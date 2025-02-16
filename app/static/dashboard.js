document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("playerSearch");
    const suggestionsBox = document.getElementById("suggestions");
    const statsContainer = document.getElementById("stats");

    // NBA Team Color Mapping
    const teamColors = {
        "ATL": ["#E03A3E", "#C1D32F"],  // Atlanta Hawks
        "BOS": ["#007A33", "#BA9653"],  // Boston Celtics
        "BKN": ["#000000", "#FFFFFF"],  // Brooklyn Nets
        "CHA": ["#1D1160", "#00788C"],  // Charlotte Hornets
        "CHI": ["#CE1141", "#000000"],  // Chicago Bulls
        "CLE": ["#6F263D", "#FFB81C"],  // Cleveland Cavaliers
        "DAL": ["#00538C", "#B8C4CA"],  // Dallas Mavericks
        "DEN": ["#0E2240", "#FEC524"],  // Denver Nuggets
        "DET": ["#C8102E", "#006BB6"],  // Detroit Pistons
        "GSW": ["#1D428A", "#FFC72C"],  // Golden State Warriors
        "HOU": ["#CE1141", "#C4CED4"],  // Houston Rockets
        "IND": ["#002D62", "#FDBB30"],  // Indiana Pacers
        "LAC": ["#C8102E", "#1D428A"],  // LA Clippers
        "LAL": ["#552583", "#FDB927"],  // Los Angeles Lakers
        "MEM": ["#5D76A9", "#12173F"],  // Memphis Grizzlies
        "MIA": ["#98002E", "#F9A01B"],  // Miami Heat
        "MIL": ["#00471B", "#EEE1C6"],  // Milwaukee Bucks
        "MIN": ["#0C2340", "#236192"],  // Minnesota Timberwolves
        "NOH": ["#0C2340", "#C8102E"],  // New Orleans Pelicans
        "NYK": ["#006BB6", "#F58426"],  // New York Knicks
        "OKC": ["#007AC1", "#EF3B24"],  // Oklahoma City Thunder
        "ORL": ["#0077C0", "#C4CED4"],  // Orlando Magic
        "PHI": ["#006BB6", "#ED174C"],  // Philadelphia 76ers
        "PHO": ["#1D1160", "#E56020"],  // Phoenix Suns
        "POR": ["#E03A3E", "#000000"],  // Portland Trail Blazers
        "SAC": ["#5A2D81", "#63727A"],  // Sacramento Kings
        "TOR": ["#CE1141", "#000000"],  // Toronto Raptors
        "UTH": ["#002B5C", "#F9A01B"],  // Utah Jazz
        "WAS": ["#002B5C", "#E31837"]   // Washington Wizards
    };

    // Auto-recommendation while typing
    searchInput.addEventListener("input", function () {
        let query = searchInput.value.trim();
        if (query.length > 0) {
            fetch(`/search?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    suggestionsBox.innerHTML = "";
                    if (data.length > 0) {
                        suggestionsBox.style.display = "block";
                    } else {
                        suggestionsBox.style.display = "none";
                    }

                    data.forEach(player => {
                        let div = document.createElement("div");
                        div.classList.add("suggestion");
                        div.textContent = player;
                        div.onclick = function () {
                            searchInput.value = player;
                            suggestionsBox.innerHTML = "";
                            suggestionsBox.style.display = "none";
                            fetchPlayerStats(player);
                        };
                        suggestionsBox.appendChild(div);
                    });
                })
                .catch(error => console.error("Error fetching player suggestions:", error));
        } else {
            suggestionsBox.style.display = "none";
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", function (event) {
        if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
            suggestionsBox.style.display = "none";
        }
    });

    // Fetch and display player stats
    function fetchPlayerStats(player) {
        fetch(`/player_stats?player=${encodeURIComponent(player)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    statsContainer.innerHTML = `<p>${data.error}</p>`;
                    return;
                }

                let team = data[0]["Tm"];
                let colors = teamColors[team] || ["#333333", "#666666"]; // Default colors

                statsContainer.style.background = `linear-gradient(45deg, ${colors[0]}, ${colors[1]})`;
                statsContainer.innerHTML = `
                    <h3 class="fade-in">${player}'s Recent Games</h3>
                    <table class="fade-in">
                        <tr>
                            <th>Date</th>
                            <th>Opponent</th>
                            <th>PTS</th>
                            <th>AST</th>
                            <th>REB</th>
                            <th>STL</th>
                            <th>BLK</th>
                        </tr>
                        ${data.map(game => `
                            <tr>
                                <td>${game["Data"]}</td>
                                <td>${game["Opp"]}</td>
                                <td>${game["PTS"]}</td>
                                <td>${game["AST"]}</td>
                                <td>${game["TRB"]}</td>
                                <td>${game["STL"]}</td>
                                <td>${game["BLK"]}</td>
                            </tr>
                        `).join('')}
                    </table>
                `;
                statsContainer.classList.add("fade-in");
            })
            .catch(error => console.error("Error fetching player stats:", error));
    }
});
