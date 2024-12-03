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
// const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
// if (!apiKey) {
//   console.error("Weather API Key is not found");
// }

function App() {
  const [weatherInfo, setWeatherInfo] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [dataHistory, setDataHistory] = useState<string>("");
  const [history, setHistory] = useState<string>("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  function toEpochTimestamp(dateTime: any) {
    const date = new Date(dateTime);
    const epochTimestamp = Math.floor(date.getTime() / 1000);
    return epochTimestamp;
  }

  function assessBP(dataSBP: number, dataDBP: number): {isNormalBP: number, bpMessage: string} {
    let isNormalBP: number;
    let bpMessage: string;

    if (dataSBP < 90 || dataDBP < 60) {
      isNormalBP = 0;
      bpMessage = `Thanks for sharing your reading! Your blood pressure readinig is abnormal today. If you haven't done so, could you recheck your blood pressure to ensure the reading is accurate?\n`;
    } else if (dataSBP >= 140 || dataDBP >= 90) {
      isNormalBP = 0;
      bpMessage = `Thanks for sharing your reading! Your blood pressure is higher than normal today. Watch for the following symptoms such as dizziness, headache, and chest discomfort. Contact your provider if needed. Otherwise, recheck your blood pressure after a few minutes of rest.\n`;
    } else {
      isNormalBP = 1;
      bpMessage = `Thanks for sharing your reading! Your blood pressure looks great.\n`;
    }

    return { isNormalBP, bpMessage };
  }

  function assessOutdoorEnv(temperature: number, weatherMain: string, currentTime: Date, sunrise: Date, sunset: Date): {inOrOut: string, dayOrNight: string, isGoodTemp: boolean, isRain: boolean} {
    let inOrOut: string;
    let dayOrNight: string;
    let isGoodTemp: boolean;
    let isRain: boolean;
    if ( currentTime >= sunrise && currentTime <= sunset ) {
      dayOrNight = 'daytime';
    } else {
      dayOrNight = 'nighttime';
    }

    if ( temperature < 45 || temperature > 90) {
      isGoodTemp = false;
    } else {
      isGoodTemp = true;
    }

    if ( weatherMain.toLocaleLowerCase().includes('rain') ) {
      isRain = true;
    } else {
      isRain = false;
    }

    if ( isRain || !isGoodTemp || dayOrNight == 'nighttime') {
      inOrOut = 'indoor';
    } else {
      inOrOut = 'outdoor';
    }

    return {inOrOut, dayOrNight, isGoodTemp, isRain}
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setLoadingHistory(true);

    // OpenWeatherMap API
    const getWeather = async (dateTime: any, cityName: any) => {

      const limit = 1;
      const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${apiKey}`;
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

      let weatherMessage: string | null = "No weather message available";
      let weatherData: string | null = "No weather data available";
      let weatherTime: string | null = "";
      const timeStamp = toEpochTimestamp(dateTime);
      const apiUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timeStamp}&appid=${apiKey}&units=imperial`;
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const dataCurrent = data.data[0];
        const temperature = dataCurrent.temp;
        const timeZoneOffset = data.timezone_offset;
        const currentTime = new Date(dataCurrent.dt * 1000 + timeZoneOffset * 1000);
        const sunrise = new Date(dataCurrent.sunrise * 1000 + timeZoneOffset * 1000);
        const sunset = new Date(dataCurrent.sunset * 1000 + timeZoneOffset * 1000);
        const timeZone = data.timezone
        const uvi = dataCurrent.uvi;
        const weatherMain = dataCurrent.weather[0].main;

        const { inOrOut, dayOrNight } = assessOutdoorEnv(temperature, weatherMain, currentTime, sunrise, sunset);
        weatherMessage = `${inOrOut}, ${dayOrNight}`;
        weatherTime = `${currentTime.toISOString()} (${timeZone})`;
        weatherData = `
          Current Time: ${weatherTime}
          Temperature: ${temperature}F
          Weather: ${weatherMain}
          UV Index: ${uvi}
          Sunrise Time: ${sunrise.toISOString()}
          Sunset time: ${sunset.toISOString()}
          Recommendation: ${inOrOut}, ${dayOrNight}
        `
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
      return { weatherMessage, weatherData, weatherTime }
    }

    try {
      // load information from user inputs
      let outputMessage: string | null = null;
      let llmMessageRec: string | null = ""; 
      let llmMessageData: string | null = "";
      let bpHistory: string | null = null;
      let historyHeading: string | null = null;
      const formData = new FormData(event.currentTarget);
      const patientName = formData.get("patientName")?.toString() || "Guest";
      const patientSex = formData.get("patientSex")?.toString() || "F";
      const patientAge = formData.get("patientAge")?.toString() || "65";
      const patientAct = formData.get("patientAct")?.toString() || "excercise";
      const dataSBP = formData.get("dataSBP")?.toString() || "120";
      const dataDBP = formData.get("dataDBP")?.toString() || "80";
      const location = formData.get("patientLoc")?.toString() || "San Diego";
      const recordDateTime = `${formData.get("dataDate")?.toString() || "2024-10-01"} ${formData.get("dataTime")?.toString() || "15:00:00+00"}`

      const patientInfo = `Sex: ${patientSex}; Age: ${patientAge};`
      const headerMessage = `Dear ${patientName}, `
      const { isNormalBP, bpMessage } = assessBP(parseInt(dataSBP), parseInt(dataDBP));

      const { weatherMessage, weatherData, weatherTime } = await getWeather(recordDateTime, location);
      setWeatherInfo(weatherData);

      console.log(patientInfo)
      console.log(isNormalBP)
      console.log(bpMessage)
      console.log(location)
      console.log(recordDateTime)
      console.log(weatherMessage)
      console.log(patientAct)

      if (dataHistory != "") {
        bpHistory = `${dataHistory}\n${weatherTime}, ${dataSBP}, ${dataDBP};`

        const { data, errors } = await amplifyClient.queries.askBedrock({
          patientMessage: bpHistory,
          weatherMessage: '',
          activityMessage: '',
          conditionMessage: 'history',
        });
        
        if (!errors) {
          llmMessageData = `${data?.body}\n` || "";
          console.log(llmMessageData)
        } else {
          console.log(errors);
        }
      } else {
        bpHistory = `${weatherTime}, ${dataSBP}, ${dataDBP};`
        console.log("No data history available.")
      }
      setDataHistory(bpHistory);
      console.log(bpHistory)

      if (isNormalBP == 1) {
        const { data, errors } = await amplifyClient.queries.askBedrock({
          patientMessage: patientInfo, // message related to patient basic info
          weatherMessage: weatherMessage, // message releated to time and weather info
          activityMessage: patientAct, // message related to patient's preferred activity
          conditionMessage: 'recommendation',
        });

        if (!errors) {
          llmMessageRec = data?.body || "";
        } else {
          console.log(errors);
        }
      }

      outputMessage = headerMessage + bpMessage + llmMessageData + llmMessageRec;
      setResult(outputMessage);

      historyHeading = `${weatherTime}, SBP: ${dataSBP}, DBP: ${dataDBP}\n`;
      if (!history) {
        setHistory(historyHeading + outputMessage + "\n");
      } else {
        setHistory(history + "\n" + historyHeading + outputMessage + "\n"); // concatenate past history
      }

    } catch (e) {
      alert(`An error occurred: ${e}`);
    } finally {
      setLoading(false);
      setLoadingHistory(false);
    }
  };

  const onClearHistory = async () => {
    setWeatherInfo("");
    setResult("");
    setHistory("");
    setDataHistory("");
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Lifestyle AI</span>
        </h1>
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
            <input type="text" className="input-field" id="dataDate" name="dataDate" placeholder="2024-11-10" />

            <div className="description-grid">Record Time</div>
            <input type="text" className="input-field" id="dataTime" name="dataTime" placeholder="08:00:00-07" />
          </div>
          <p className="description">
              Patient's Preferred Type of Recommendation
          </p>
          <input type="text" className="wide-input" id="patientAct" name="patientAct" placeholder="(exercise, relax, sleep, diet)" />
          <p className="description"></p>
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
      <div className="result-container">
        <p className="description">
          Communication Hisotry
        </p>
        {loadingHistory ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          history && <p className="result">{history}</p>
        )}
      </div>
      <form onSubmit={onClearHistory} className="form-container">
        <button type="submit" className="search-button">
          Clear History
        </button>
      </form>
    </div>
  );
}

export default App;
