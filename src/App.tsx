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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // OpenWeatherMap API
    const getWeather = async () => {
      const lat = 32.7157;
      const lon = -117.1611;
      const timeStamp = 1728090914;
      const apiUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timeStamp}&appid=${apiKey}&units=imperial`;
      // const part = `minutely,hourly,daily,alerts`;
      // const apiUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${part}&appid=${apiKey}&units=imperial`;
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const dataCurrent = data.data[0];
        const temperature = dataCurrent.temp;
        const sunrise = dataCurrent.sunrise;
        const sunset = dataCurrent.sunset;
        const timeZone = data.timezone
        const uvi = dataCurrent.uvi;
        const weatherMain = dataCurrent.weather[0].main;
        const weatherMessage = `
          Temperature: ${temperature}F; 
          Weather: ${weatherMain}; 
          UV Index: ${uvi}; 
          Sunrise UTC Time: ${sunrise}; 
          Sunset UTC time: ${sunset}; 
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

      const location = formData.get("patientLoc")?.toString() || ""
      const recordTime = `${formData.get("dataDate")?.toString() || ""} ${formData.get("dataTime")?.toString() || ""}`

      const weatherMessage = await getWeather();
      setWeatherInfo(weatherMessage);

      console.log(patientInfo)
      console.log(patientData)
      console.log(location)
      console.log(recordTime)
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
            <input type="text" className="input-field" id="dataDate" name="dataDate" placeholder="2024/10/01" />

            <div className="description-grid">Record Time</div>
            <input type="text" className="input-field" id="dataTime" name="dataTime" placeholder="09:00:00" />
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
