import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  // State to manage patient input and response
  const [inputInfo, setInputInfo] = useState<string>("");
  const [inputData, setInputData] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [testResponse, setTestResponse] = useState<string>("");

  // Handler to submit patient info
  async function testPatientInfo() {
    try {
      const simulatedResponse = await new Promise<string>((resolve) =>
        setTimeout(() => resolve(`Test Response for: \n${inputInfo}\n${inputData}`), 1000)
      );
      setTestResponse(simulatedResponse);
    } catch (error) {
      console.error("Error submitting patient info", error);
      setTestResponse("An error occurred.");
    }
  }

  useEffect(() => {
    const subscription = client.models.PatientInfo.observeQuery().subscribe({
      next: (data) => {
        if (data.items.length > 0) {
          const lastestPatientInfo = data.items[data.items.length -1];
          setResponse(`AI Response for: \n${lastestPatientInfo.patientInfo}\n${lastestPatientInfo.patientData}`)
        }
      }
    });
  }, []); 
 
  function createPatientProfile() {
    client.models.PatientInfo.create({ patientInfo: inputInfo, patientData: inputData });
  }

  // const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  // useEffect(() => {
  //   client.models.Todo.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }, []);
  // function createTodo() {
  //   client.models.Todo.create({ content: window.prompt("Todo content") });
  // }
  // function deleteTodo(id: string) {
  //   client.models.Todo.delete({ id })
  // }

  return (
    <main>
      {/* New Patient Info Section */}
      <section>
        <h1>Demo User Interface</h1>
        <h2>Patient Basic Info</h2>
        <textarea
          placeholder="Enter patient basic info here..."
          value={inputInfo}
          onChange={(e) => setInputInfo(e.target.value)}
          rows={8}
          style={{ width: "150%" }}
        />
        <h2>Patient Vital Data</h2>
        <textarea
          placeholder="Enter patient vital data here..."
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          rows={8}
          style={{ width: "150%" }}
        /> 
        <button onClick={createPatientProfile}>Submit</button>
      </section>

      {/* Recommendations */}
      <section>
        <h2>AI Response</h2>
        <textarea
          placeholder="AI response will be displayed here..."
          value={response}
          readOnly
          rows={8}
          style={{ width: "150%" }}
        />
        <h2>Test Responose</h2>
        <button onClick={testPatientInfo}>Test</button>
        <textarea
          placeholder="Test responsse"
          value={testResponse}
          readOnly
          rows={8}
          style={{ width: "150%" }}
        />
      </section>

      {/* Existing Todo section */}
      {/* <section>
        <h1>My todos</h1>
        <button onClick={createTodo}>+ new</button>
        <ul>
          {todos.map((todo) => (
            <li onClick={() => deleteTodo(todo.id)} key={todo.id}>{todo.content}</li>
          ))}
        </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review next step of this tutorial.
            </a>
          </div>
      </section> */}
    </main>
  );
}

export default App;
