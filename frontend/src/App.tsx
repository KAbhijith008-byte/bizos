import { useEffect, useState } from 'react';

function App() {
  const [pythonMsg, setPythonMsg] = useState('');
  const [rustMsg, setRustMsg] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/hello')
      .then(res => res.json())
      .then(data => setPythonMsg(data.message))
      .catch(() => setPythonMsg('Python backend not reachable'));

    fetch('http://localhost:8001/api/hello')
      .then(res => res.json())
      .then(data => setRustMsg(data.message))
      .catch(() => setRustMsg('Rust backend not reachable'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>BizOS</h1>
      <p><strong>Python backend:</strong> {pythonMsg}</p>
      <p><strong>Rust backend:</strong> {rustMsg}</p>
    </div>
  );
}

export default App;
