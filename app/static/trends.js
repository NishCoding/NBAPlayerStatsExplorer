document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("playerSearch");
    const suggestionsBox = document.getElementById("suggestions");
    let playerChart; // Store chart instance to update dynamically

    // Auto-recommendations while typing
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
                        };
                        suggestionsBox.appendChild(div);
                    });
                });
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

    // Fetch and display player trends
    window.fetchPlayerTrends = function () {
        let player = searchInput.value.trim();
        if (!player) {
            alert("Please enter a player name.");
            return;
        }

        fetch(`/player_trends?player=${encodeURIComponent(player)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }

                // Limit data to the most recent 20 games to avoid overloading the chart
                let maxDataPoints = 20;
                data = data.slice(-maxDataPoints); // Only keep the last 'maxDataPoints' games

                // Format the date in MM-DD-YYYY
                let labels = data.map(game => {
                    let date = new Date(game.Date);
                    // Check if the date is valid
                    if (!isNaN(date)) {
                        let month = date.getMonth() + 1; // Get month (0-indexed, so add 1)
                        let day = date.getDate();
                        let year = date.getFullYear();
                        return `${month}-${day}-${year}`; // Return formatted date as MM-DD-YYYY
                    } else {
                        return ""; // Return empty if the date is invalid
                    }
                });

                let points = data.map(game => game.PTS);
                let assists = data.map(game => game.AST);
                let rebounds = data.map(game => game.REB);

                let ctx = document.getElementById("playerChart").getContext("2d");

                // Destroy previous chart if exists
                if (playerChart) {
                    playerChart.destroy();
                }

                // Create new chart with size adjustments
                playerChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: "Points",
                                data: points,
                                borderColor: "red",
                                fill: false,
                                pointStyle: 'circle', // Change point style to circle (dot)
                                pointRadius: 5, // Adjust the size of the dot
                                pointBackgroundColor: "white" // Set point color to white
                            },
                            {
                                label: "Assists",
                                data: assists,
                                borderColor: "blue",
                                fill: false,
                                pointStyle: 'circle', // Change point style to circle (dot)
                                pointRadius: 5, // Adjust the size of the dot
                                pointBackgroundColor: "white" // Set point color to white
                            },
                            {
                                label: "Rebounds",
                                data: rebounds,
                                borderColor: "green",
                                fill: false,
                                pointStyle: 'circle', // Change point style to circle (dot)
                                pointRadius: 5, // Adjust the size of the dot
                                pointBackgroundColor: "white" // Set point color to white
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false, // Ensures it fills the container but doesn't overflow
                        scales: {
                            x: {
                                title: { display: true, text: "Game Date", color: "white" },
                                ticks: {
                                    maxRotation: 45, // Prevent labels from overlapping
                                    minRotation: 0,
                                    color: "white" // Set X-axis ticks color to white
                                }
                            },
                            y: {
                                title: { display: true, text: "Stats", color: "white" },
                                beginAtZero: true,
                                ticks: {
                                    color: "white" // Set Y-axis ticks color to white
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: 'white' // Set legend text color to white
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => console.error("Error fetching player trends:", error));
    };
});
