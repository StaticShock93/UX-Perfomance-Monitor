import UXMonitorToggle from './UXMonitorToggle';

function App() {
  return (
    <div className="App">
      <h1>Hello UX Monitor</h1>
      {/* Dev-only toggle */}
      {import.meta.env.DEV && <UXMonitorToggle />}
    </div>
  );
}

export default App;
