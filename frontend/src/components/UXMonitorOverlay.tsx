import React, {useEffect, useRef, useState} from 'react';

// interface Metrics {
// 	fps: number;
// 	dropped: number;
// 	score: number;
// 	timestamp: number;
// 	url: string;
// 	userAgent: string;
// }

interface UXMonitorOverlayProps {
	onClose: () => void;
}

const UXMonitorOverlay: React.FC<UXMonitorOverlayProps> = ({onClose}) => {
	const [fps, setFps] = useState<number>(0); // frames per second  ==> fps = frameCount / (totalTime / 1000)
	const [dropped, setDropped] = useState<number>(0); // number of dropped frames per prior second
	const [score, setScore] = useState<number>(100); // overall UX health score (100 === perfect)
	const [blips, setBlips] = useState<number[]>([]); //frame timestamps used for mini bar graph

	const lastFrameTime = useRef(performance.now()); // stores timestamp of previous animation frame
	const frameCount = useRef(0); // increments every frame, use to calculate FPS
	const droppedFrames = useRef(0); // number of missed / delayed frames based on expected vs actual rendering
	const totalTime = useRef(0); // total time passed (in ms) since last score update. When 1000ms passed, recalculate average fps, droppedFrames, && score

	useEffect(() => {
		let animationFrame: number;

		const trackFPS = (now: number) => {
			const delta = now - lastFrameTime.current; // diff btwn current frame timestamp and last frame timestamp
			lastFrameTime.current = now; // update lastFrame timestamp to current time for next frame calculation

			const expectedFrames = delta / (1000 / 60); // calculate expected frames per second at 60fps
			const droppedNow = Math.max(0, Math.floor(expectedFrames - 1)); // calculate dropped frames (AIM FOR 0)...assumes 1 frame is always rendered, any more time == droppedFrames

			droppedFrames.current += droppedNow; // accumulates total number of dropped frames
			totalTime.current += delta; //  accumulates the total time elapsed since the last FPS computation
			frameCount.current++; // incrememnt/accumulate total frame count

			// upated blips array with timestamp of when frame rate dropped below 60fps
			if (droppedNow > 0) {
				setBlips((prev) => [...prev, Date.now()]);
			}

			// re-calculate UX data summary every 1sec (update state values for metrics)
			if (totalTime.current >= 1000) {
				const avgFPS = frameCount.current / (totalTime.current / 1000); // avgFps = { frameCount / (totalTime / 1000) }
				setFps(parseFloat(avgFPS.toFixed(1)));
				setDropped(droppedFrames.current);

				// let scoreCalc = 100 - (60 - avgFPS) * 1.5 - droppedFrames.current * 2;  // ScoreFormula= 100−(60−avgFPS)×1.5−(droppedFrames)×2
				let scoreCalc = 100 - (60 - avgFPS) * 3 - droppedFrames.current * 5; // Stricter ScoreFormula=100−(60−avgFPS)×3−(droppedFrames)×5 ===> Penalty multipliers increased
				setScore(Math.max(0, Math.min(100, Math.round(scoreCalc))));

				totalTime.current = 0;
				frameCount.current = 0;
				droppedFrames.current = 0;
				setBlips([]);
			}

			animationFrame = requestAnimationFrame(trackFPS);
		};

		animationFrame = requestAnimationFrame(trackFPS);

		return () => cancelAnimationFrame(animationFrame);
	}, []);

	// const sendSessionReport = () => {
	// 	const payload: Metrics = {
	// 		fps,
	// 		dropped,
	// 		score,
	// 		timestamp: Date.now(),
	// 		url: window.location.pathname,
	// 		userAgent: navigator.userAgent,
	// 	};

	// 	fetch('/api/ux-metrics', {
	// 		method: 'POST',
	// 		headers: {'Content-Type': 'application/json'},
	// 		body: JSON.stringify(payload),
	// 	});
	// };

	return (
		<div
			style={{
				position: 'fixed',
				bottom: '1rem',
				right: '1rem',
				background: 'rgba(255,255,255,0.9)',
				boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
				borderRadius: '0.75rem',
				padding: '1rem',
				fontSize: '0.875rem',
				zIndex: 9999,
				width: '16rem',
				border: '1px solid #D1D5DB',
				fontFamily: 'sans-serif',
			}}>
			{/* Header Row with Title and Close Button */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					fontWeight: 600,
					marginBottom: '0.5rem',
				}}>
				<span>🎛 UX Monitor</span>
				<button
					onClick={onClose}
					aria-label='Close Monitor'
					style={{
						color: '#6B7280',
						fontSize: '1.125rem',
						lineHeight: 1,
						cursor: 'pointer',
						background: 'none',
						border: 'none',
					}}
					onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
					onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}>
					❌
				</button>
			</div>

			<div
				style={{
					marginBottom: '0.25rem',
					all: 'unset',
					display: 'block',
					textAlign: 'start',
				}}>
				🎯 Score: <span style={{fontFamily: 'monospace'}}>{score}</span>
			</div>
			<div
				style={{
					marginBottom: '0.25rem',
					all: 'unset',
					display: 'block',
					textAlign: 'start',
				}}>
				🎞 FPS: <span style={{fontFamily: 'monospace'}}>{fps}</span>
			</div>
			<div
				style={{
					marginBottom: '0.75rem',
					all: 'unset',
					display: 'block',
					textAlign: 'start',
				}}>
				❗ Dropped Frames:{' '}
				<span style={{fontFamily: 'monospace'}}>{dropped}</span>
			</div>

			{/* <button
				// onClick={sendSessionReport}
				style={{
					backgroundColor: '#000',
					color: '#fff',
					borderRadius: '0.375rem',
					padding: '0.25rem 0.75rem',
					fontSize: '0.75rem',
					cursor: 'pointer',
					border: 'none',
				}}
			>
				Send Report
			</button> */}

			<div style={{display: 'flex', marginTop: '0.75rem', height: '0.5rem'}}>
				{/* Calculates and represents frames dropped per the prior 3 seconds on the bar/blip graph */}
				{Array.from({length: 30})
					.map((_, barIndex) => {
						const timestampForBar = Date.now() - barIndex * 100; // adust 100ms to 50ms for shorter interval (checks every 1.5s) or increase if longer interval desired
						const recentDrop = blips.find(
							(blipTimeStamp) => Math.abs(blipTimeStamp - timestampForBar) < 50
						); // change 50 to 75 for larger window and low for more precision.. can make dynamic in the future
						return (
							<div
								key={barIndex}
								style={{
									width: '0.25rem',
									height: '0.5rem',
									backgroundColor: recentDrop ? '#EF4444' : '#86EFAC',
									margin: '0 0.5px',
								}}
							/>
						);
					})
					.reverse()}
			</div>
		</div>
	);
};

export {UXMonitorOverlay};
