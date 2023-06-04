const express = require('express');
const sqlite = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const port = 8080;
const db = new sqlite.Database('weather.db');

app.use(cors());

app.get('/api/weather', async (req, res) => {
    saveData();

    const { station } = req.query;
    
    if (station) {
      const query = `SELECT * FROM weather_data WHERE stacja = ?`;
      db.all(query, [station], (error, rows) => {
        if (error) {
          console.error('Error retrieving weather data:', error);
          res.status(500).json({ error: 'An error occurred while retrieving weather data' });
        } else {
          res.json(rows);
        }
      });
    } else {
      const query = `SELECT * FROM weather_data`;
      db.all(query, (error, rows) => {
        if (error) {
          console.error('Error retrieving weather data:', error);
          res.status(500).json({ error: 'An error occurred while retrieving weather data' });
        } else {
          res.json(rows);
        }
      });
    }
  });

app.get('/api/stacje', async (req, res) => {
    const query = "SELECT DISTINCT stacja FROM weather_data";
    
    db.all(query, [], (error, rows) => {
        if(error) {
            console.error('Error retrieving stations:', error);
            res.status(500).json({ error: 'An error occurred while retrieving stations' });
        } else {
            const stations = rows.map((row) => row.stacja);
            res.json(stations);
        }
    });
});

async function saveData(){
    const response = await fetch("https://danepubliczne.imgw.pl/api/data/synop");
    const weatherData = await response.json();
    const query  = `INSERT INTO weather_data (
        id_stacji,
        stacja,
        data_pomiaru,
        godzina_pomiaru,
        temperatura,
        predkosc_wiatru,
        kierunek_wiatru,
        wilgotnosc_wzgledna,
        suma_opadu,
        cisnienie
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.run('DELETE FROM weather_data');

    for(const data of weatherData){
        const values = [
            data.id_stacji,
            data.stacja,
            data.data_pomiaru,
            data.godzina_pomiaru,
            data.temperatura,
            data.predkosc_wiatru,
            data.kierunek_wiatru,
            data.wilgotnosc_wzgledna,
            data.suma_opadu,
            data.cisnienie
        ];

        db.run(query, values);
    }
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});