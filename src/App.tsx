import { FormEvent, useEffect, useState } from "react";
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

// const client = generateClient<Schema>();

function App() {
  // State to manage patient input and response
  // const [inputInfo, setInputInfo] = useState<string>("");
  // const [inputData, setInputData] = useState<string>("");
  // const [response, setResponse] = useState<string>("");
  // const [testResponse, setTestResponse] = useState<string>("");

  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Handler to submit patient info
  // async function testPatientInfo() {
  //   try {
  //     const simulatedResponse = await new Promise<string>((resolve) =>
  //       setTimeout(() => resolve(`Test Response for: \n${inputInfo}\n${inputData}`), 1000)
  //     );
  //     setTestResponse(simulatedResponse);
  //   } catch (error) {
  //     console.error("Error submitting patient info", error);
  //     setTestResponse("An error occurred.");
  //   }
  // }

  // useEffect(() => {
  //   const subscription = client.models.PatientInfo.observeQuery().subscribe({
  //     next: (data) => {
  //       if (data.items.length > 0) {
  //         const lastestPatientInfo = data.items[data.items.length -1];
  //         setResponse(`AI Response for: \n${lastestPatientInfo.patientInfo}\n${lastestPatientInfo.patientData}`)
  //       }
  //     }
  //   });
  //   // Cleanup the subscription when the component unmounts
  //   return () => {
  //     subscription.unsubscribe();
  //   };
  // }, []); 
 
  // function createPatientProfile() {
  //   client.models.PatientInfo.create({ patientInfo: inputInfo, patientData: inputData });
  // }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      const { data, errors } = await amplifyClient.queries.askBedrock({
        patientInfo: formData.get("patientInfo")?.toString() || "",
        patientData: formData.get("patientData")?.toString() || "",
        envData: formData.get("envData")?.toString() || "",
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
    // <main>
    //   {/* New Patient Info Section */}
    //   <section>
    //     <h1>Demo User Interface</h1>
    //     <h2>Patient Basic Info</h2>
    //     <textarea
    //       placeholder="Enter patient basic info here..."
    //       value={inputInfo}
    //       onChange={(e) => setInputInfo(e.target.value)}
    //       rows={8}
    //       style={{ width: "150%" }}
    //     />
    //     <h2>Patient Vital Data</h2>
    //     <textarea
    //       placeholder="Enter patient vital data here..."
    //       value={inputData}
    //       onChange={(e) => setInputData(e.target.value)}
    //       rows={8}
    //       style={{ width: "150%" }}
    //     /> 
    //     <button onClick={createPatientProfile}>Submit</button>
    //   </section>

    //   {/* Recommendations */}
    //   <section>
    //     <h2>AI Response</h2>
    //     <textarea
    //       placeholder="AI response will be displayed here..."
    //       value={response}
    //       readOnly
    //       rows={8}
    //       style={{ width: "150%" }}
    //     />
    //     <h2>Test Responose</h2>
    //     <button onClick={testPatientInfo}>Test</button>
    //     <textarea
    //       placeholder="Test responsse"
    //       value={testResponse}
    //       readOnly
    //       rows={8}
    //       style={{ width: "150%" }}
    //     />
    //   </section>
    // </main>
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Lifestyle AI</span>
        </h1>
        <p className="description">
          Input personal basic information and vital data, and Lifestyle AI will generate a recommendation.
        </p>
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <p className="description-info">
            Patient Basic Info
          </p>
          <input
            type="text"
            className="wide-input"
            id="patientInfo"
            name="patientInfo"
            placeholder="Input patient basic information"
          />
          <p className="description-data">
            Patient Vital Data
          </p>
          <input
            type="text"
            className="wide-input"
            id="patientData"
            name="patientData"
            placeholder="Input patient's blood pressure data"
          />
          <p className="description-data">
            Local Date, Time, Weather
          </p>
          <input
            type="text"
            className="wide-input"
            id="envData"
            name="envData"
            placeholder="Input local time and weather"
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>
      <div className="result-container">
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
    </div>
  );
}

export default App;
