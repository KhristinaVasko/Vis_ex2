from flask import Flask, render_template
import json
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

app = Flask(__name__)

# ensure that we can reload when we change the HTML / JS for debugging
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

#Reading data
df_agg_player = pd.read_csv('static/data/df_agg_player.csv')
df_seas_player = pd.read_csv('static/data/cleaned_df_player_stats.csv')

# Top 40 players who played the most games
top_40_players = df_agg_player.nlargest(40, 'Total Games')

# We do not need some of the informations about the players (birth place, url...)
relevant_stats = ['Player ID', 'Name', 'Height', 'Weight', 'Total Seasons', 'Total Games', 'Games Started', 'Total Minutes Played',
                  'Field Goals', 'Field Goals Attempted', 'Field Goal %', '3pt',
                  '3pt Attempted', '3pt %', '2pt', '2pt Attempted', '2pt %',
                  'Free Throws', 'Free Throws Attempted', 'Free Throws %',
                  'Offensive Rebounds', 'Defensive Rebounds', 'Total Rebounds',
                  'Assists', 'Steals', 'Blocks', 'Turnovers', 'Personal Fouls', 'Points']

player_data = top_40_players[relevant_stats]

# Auswahl der relevanten Spalten
relevant_columns = ['player_id', 'season', 'total_games', 'games_started', 'minutes_played',
                    'fg', 'fga', 'fgp', 'fg3', 'fg3a', 'fg3p', 'fg2', 'fg2a', 'fg2p',
                    'ft', 'fta', 'ftp', 'orb', 'drb', 'trb', 'ast', 'stl', 'blk', 'tov', 'pf', 'pts',
                    'name', 'height', 'weight']

# Auswahl der relevanten Zeilen basierend auf player_data['Player ID']
top_player_ids = player_data['Player ID'].tolist()
df_filtered = df_seas_player[relevant_columns][df_seas_player['player_id'].isin(top_player_ids)]

print(df_filtered.head())


# Scaling the numeric data
scaler = StandardScaler()
scaled_player_data = scaler.fit_transform(player_data.drop(columns=['Player ID','Name']))

# Build dataframe with scaled data
player_df = pd.DataFrame(data=scaled_player_data, columns=player_data.drop(columns=['Player ID','Name']).columns)

# Name and player ID back in the scaled dataframe
player_id_df = player_data[['Player ID', 'Name']].reset_index(drop=True)
player_df = pd.concat([player_df, player_id_df], axis=1)

# PCA
pca = PCA(n_components=2)
pca_result = pca.fit_transform(scaled_player_data)

# Results into dataframe
pca_df = pd.DataFrame(data=pca_result, columns=['PC1', 'PC2'])
player_df[['PC1', 'PC2']] = pca_df[['PC1', 'PC2']]

print(player_df.head())

# Scatterplot to verify results
plt.figure(figsize=(10, 6))
plt.scatter(player_df['PC1'], player_df['PC2'])
plt.title('PCA Scatterplot')
plt.grid(True)
plt.show()


@app.route('/')
def data():
    # replace this with the real data
    testData = ["df_agg_player", "df_seas_player"]

    # return the index file and the data
    return render_template("index.html", data=json.dumps(testData))


if __name__ == '__main__':
    app.run(debug=True)
