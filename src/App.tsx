import { FormEvent, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const amplifyClient = generateClient<Schema>({
  authMode: "userPool",
});
const apiKey = 'e08ec60aa69dc44b833afcf9d49deccc';

function App() {
  const [weatherInfo, setWeatherInfo] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  function toEpochTimestamp(dateTime: any) {
    const date = new Date(dateTime);
    const epochTimestamp = Math.floor(date.getTime() / 1000);
    return epochTimestamp;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // OpenWeatherMap API
    const getWeather = async (dateTime: any, cityName: any) => {

      const limit = 1;
      const geoApiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${apiKey}`;
      let lat: number | null = null;
      let lon: number | null = null;
      
      try {
        const response = await fetch(geoApiUrl);
        const data = await response.json();
        console.log(data);
        lat = data[0].lat;
        lon = data[0].lon;
      } catch (error) {
        console.error('Error fetching Geo coordinates:', error);
      }
      if (lat === null || lon === null) {
        console.error(`Error: Unable to fetch weather data due to missing coordinates. Use San Diego's coordinates as default.`);
        lat = 32.7157;
        lon = -117.1611;
      }

      const timeStamp = toEpochTimestamp(dateTime);
      const apiUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timeStamp}&appid=${apiKey}&units=imperial`;
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const dataCurrent = data.data[0];
        const temperature = dataCurrent.temp;
        const timeZoneOffset = data.timezone_offset;
        const currentTime = new Date(dataCurrent.dt * 1000 + timeZoneOffset * 1000).toISOString();
        const sunrise = new Date(dataCurrent.sunrise * 1000 + timeZoneOffset * 1000).toISOString();
        const sunset = new Date(dataCurrent.sunset * 1000 + timeZoneOffset * 1000).toISOString();
        const timeZone = data.timezone
        const uvi = dataCurrent.uvi;
        const weatherMain = dataCurrent.weather[0].main;
        const weatherMessage = `
          Current Time: ${currentTime};
          Temperature: ${temperature}F; 
          Weather: ${weatherMain}; 
          UV Index: ${uvi}; 
          Sunrise Time: ${sunrise}; 
          Sunset time: ${sunset}; 
          Time Zone: ${timeZone};
        `
        return weatherMessage
      } catch (error) {
        console.error('Error fetching weather data:', error);
        return "No weather data available"
      }
    }

    try {
      const formData = new FormData(event.currentTarget);
      
      const patientInfo = `
      Patient Name: ${formData.get("patientName")?.toString() || "Guest"}; 
      Sex: ${formData.get("patientSex")?.toString() || "F"}; 
      Age: ${formData.get("patientAge")?.toString() || "65"}; 
      `
      const patientData = `
      Systolic Blood Pressure: ${formData.get("dataSBP")?.toString() || "120"}; 
      Diastolic Blood Pressure: ${formData.get("dataDBP")?.toString() || "80"};
      `

      const location = formData.get("patientLoc")?.toString() || "San Diego";
      const recordDateTime = `${formData.get("dataDate")?.toString() || "2024-10-01"} ${formData.get("dataTime")?.toString() || "15:00:00+00"}`

      const weatherMessage = await getWeather(recordDateTime, location);
      setWeatherInfo(weatherMessage);

      console.log(patientInfo)
      console.log(patientData)
      console.log(location)
      console.log(recordDateTime)
      console.log(weatherMessage)

      const { data, errors } = await amplifyClient.queries.askBedrock({
        patientInfo: patientInfo,
        patientData: patientData,
        weatherData: weatherMessage,
      });

      if (!errors) {
        setResult(data?.body || "No data returned");
      } else {
        console.log(errors);
      }
    } catch (e) {
      alert(`An error occurred: ${e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Lifestyle AI</span>
        </h1>
        {/* <p className="description">
          Input personal basic information and vital data, and Lifestyle AI will generate a recommendation.
        </p> */}
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <p className="description">
              Patient's Basic Information
          </p>
          <div className="grid-container">
            <div className="description-grid">Name</div>
            <input type="text" className="input-field" id="patientName" name="patientName" placeholder="First, Last" />

            <div className="description-grid">Sex</div>
            <input type="text" className="input-field" id="patientSex" name="patientSex" placeholder="F" />

            <div className="description-grid">Age</div>
            <input type="text" className="input-field" id="patientAge" name="patientAge" placeholder="65" />

            <div className="description-grid">Location</div>
            <input type="text" className="input-field" id="patientLoc" name="patientLoc" placeholder="San Diego" />
          </div>
          <p className="description">
              Patient's Blood Pressure Data Today
          </p>
          <div className="grid-container">
            <div className="description-grid">Systolic BP</div>
            <input type="text" className="input-field" id="dataSBP" name="dataSBP" placeholder="120" />

            <div className="description-grid">Diastolic BP</div>
            <input type="text" className="input-field" id="dataDBP" name="dataDBP" placeholder="80" />

            <div className="description-grid">Record Date</div>
            <input type="text" className="input-field" id="dataDate" name="dataDate" placeholder="2024-10-01" />

            <div className="description-grid">Record Time</div>
            <input type="text" className="input-field" id="dataTime" name="dataTime" placeholder="15:00:00+00" />
          </div>
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>
      <div className="result-container">
        <p className="description">
          Lifestyle AI's Message to the Patient
        </p>
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          result && <p className="result">{result}</p>
        )}
      </div>
      <div className="result-container">
        <p className="description">
          Local Weather Information
        </p>
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          weatherInfo && <p className="result">{weatherInfo}</p>
        )}
      </div>
    </div>
  );
}

export default App;
