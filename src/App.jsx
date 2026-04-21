import { useState } from "react";
import axios from "axios";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [forecast, setForecast] = useState([]);
  const [farmerMode, setFarmerMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🌤️ SEARCH BY CITY
  const getWeather = async () => {
    if (!city) return;

    try {
      setLoading(true);
      setError("");

      const weatherRes = await axios.get(
        `http://localhost:5000/weather?city=${city}`
      );
      setWeather(weatherRes.data);

      const forecastRes = await axios.get(
        `http://localhost:5000/forecast?city=${city}`
      );

      const dailyData = forecastRes.data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
      );

      setForecast(dailyData);
    } catch (err) {
      setError("City not found or API error");
      setWeather(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  // 📍 LOCATION WEATHER (FIXED ERROR HANDLING)
  const getCurrentLocationWeather = () => {
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await axios.get(
            `http://localhost:5000/weather?lat=${latitude}&lon=${longitude}`
          );

          setWeather(res.data);
          setError("");
        } catch {
          setError("Failed to get location weather");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      }
    );
  };

  // 📜 HISTORY
  const getHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/history");
      setHistory(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 INSIGHTS
  const getInsight = () => {
    if (!weather) return "";

    const temp = weather.main.temp;
    const condition = weather.weather[0].main;

    if (condition === "Rain") return "🌧️ Rain expected — carry an umbrella!";
    if (temp > 30) return "🔥 It's hot — stay hydrated!";
    if (temp < 15) return "🧥 It's cold — wear warm clothes!";
    return "🌤️ Weather looks good!";
  };

  const getFarmerInsight = () => {
    if (!weather) return "";

    const temp = weather.main.temp;
    const condition = weather.weather[0].main;

    if (condition === "Rain") return "🌱 Good day for planting!";
    if (temp > 32) return "💧 Irrigation recommended!";
    return "✅ Stable conditions for crops.";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Weather App - Happiness</h1>

      <input
        type="text"
        placeholder="Enter city"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={getWeather}>Search</button>
        <button onClick={getCurrentLocationWeather}>
          Use My Location 📍
        </button>
        <button onClick={getHistory}>View History</button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <button onClick={() => setFarmerMode(!farmerMode)}>
          Toggle Farmer Mode 🌾
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* WEATHER */}
      {weather && (
        <div style={{ marginTop: "20px" }}>
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <p>{weather.weather[0].description}</p>

          <p style={{ fontWeight: "bold" }}>{getInsight()}</p>

          {farmerMode && (
            <p style={{ color: "green", fontWeight: "bold" }}>
              {getFarmerInsight()}
            </p>
          )}
        </div>
      )}

      {/* FORECAST */}
      {forecast.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>5-Day Forecast</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
            {forecast.map((day, index) => (
              <div key={index} style={{ border: "1px solid #ccc", padding: "10px" }}>
                <p>{new Date(day.dt_txt).toLocaleDateString()}</p>
                <p>🌡 {day.main.temp}°C</p>
                <p>{day.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY */}
      {history.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Search History</h2>
          {history.map((item, index) => (
            <div key={index}>
              <p>
                {item.city} - {item.temperature}°C - {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;