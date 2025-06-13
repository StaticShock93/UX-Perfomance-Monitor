import AnimationTestBox from './AnimationTestBox';
import UXMonitorToggle from './UXMonitorToggle';

function App() {
  return (
    <div className="App">
      <h1>Hello UX Monitor</h1>
      {/* Dev-only toggle */}
      {import.meta.env.DEV && <UXMonitorToggle />}

	  {/* ADD ANY ANIMATION TO TEST HERE DIRECTLY */}
		<AnimationTestBox />
    </div>
  );
}

export default App;
