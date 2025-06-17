import {UXMonitorToggle} from './UXMonitorToggle';

function App() {
  return (
    <div className="App">
      {/* Dev-only toggle */}
      {import.meta.env.DEV && <UXMonitorToggle />}
	  {/* ADD ANY ANIMATION TO TEST HERE DIRECTLY */}
    </div>
  );
}

export default App;
