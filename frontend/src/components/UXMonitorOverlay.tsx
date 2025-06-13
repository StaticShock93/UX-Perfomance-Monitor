// components/UXMonitorOverlay.tsx
import React, {useEffect, useRef, useState} from 'react';

interface Metrics {
	fps: number;
	dropped: number;
	score: number;
	timestamp: number;
	url: string;
	userAgent: string;
}

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
		<div className='fixed bottom-4 right-4 bg-white/90 shadow-lg rounded-xl p-4 text-sm z-[9999] w-64 border border-gray-300'>
			{/* Header Row with Title and Close Button */}
			<div className='flex justify-between items-center font-semibold mb-2'>
				<span>🎛 UX Monitor</span>
				<button
					onClick={onClose}
					aria-label='Close Monitor'
					className='text-gray-500 hover:text-red-500 text-lg leading-none cursor-pointer'>
					❌
				</button>
			</div>

			<div className='mb-1'>
				🎯 Score: <span className='font-mono'>{score}</span>
			</div>
			<div className='mb-1'>
				🎞 FPS: <span className='font-mono'>{fps}</span>
			</div>
			<div className='mb-3'>
				❗ Dropped Frames: <span className='font-mono'>{dropped}</span>
			</div>
			<button
				// onClick={sendSessionReport}
				className='bg-black text-white rounded-md px-3 py-1 text-xs hover:bg-gray-800'>
				Send Report
			</button>
			<div className='flex mt-3 h-2'>
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
								className={`w-1 h-2 ${
									recentDrop ? 'bg-red-500' : 'bg-green-300'
								} mx-[0.5px]`}
							/>
						);
					})
					.reverse()}
			</div>
		</div>
	);
};

export default UXMonitorOverlay;
