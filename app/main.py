import pandas as pd
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Load dataset
df = pd.read_csv("nba_data.csv")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/search', methods=['GET'])
def search_player():
    query = request.args.get('q', '').lower()
    matching_players = df["Player"].dropna().unique()
    suggestions = [player for player in matching_players if query in player.lower()]
    return jsonify(suggestions[:10])

@app.route('/player_stats', methods=['GET'])
def player_stats():
    player_name = request.args.get('player')
    if not player_name:
        return jsonify({"error": "Player name is required"}), 400

    player_data = df[df["Player"].str.lower() == player_name.lower()]
    if player_data.empty:
        return jsonify({"error": "Player not found"}), 404

    return jsonify(player_data.to_dict(orient='records'))

# New route for Player Trends page
@app.route('/player_trends_page')
def player_trends_page():
    return render_template('player_trends.html')

# New API route to fetch Player Trends data
@app.route('/player_trends', methods=['GET'])
def player_trends():
    player_name = request.args.get('player')
    if not player_name:
        return jsonify({"error": "Player name is required"}), 400

    player_data = df[df["Player"].str.lower() == player_name.lower()]
    if player_data.empty:
        return jsonify({"error": "Player not found"}), 404

    # Extract relevant columns
    trend_data = player_data[["Data", "PTS", "AST", "TRB"]].rename(columns={"Data": "Date", "TRB": "REB"})
    return jsonify(trend_data.to_dict(orient='records'))


if __name__ == '__main__':
    app.run(debug=True)