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
	const [fps, setFps] = useState<number>(0);
	const [dropped, setDropped] = useState<number>(0);
	const [score, setScore] = useState<number>(100);
	const [blips, setBlips] = useState<number[]>([]);

	const lastFrameTime = useRef(performance.now());
	const frameCount = useRef(0);
	const droppedFrames = useRef(0);
	const totalTime = useRef(0);

	useEffect(() => {
		let animationFrame: number;

		const trackFPS = (now: number) => {
			const delta = now - lastFrameTime.current;
			lastFrameTime.current = now;

			const expectedFrames = delta / (1000 / 60);
			const droppedNow = Math.max(0, Math.floor(expectedFrames - 1));

			droppedFrames.current += droppedNow;
			totalTime.current += delta;
			frameCount.current++;

			if (droppedNow > 0) {
				setBlips((prev) => [...prev, Date.now()]);
			}

			if (totalTime.current >= 1000) {
				const avgFPS = frameCount.current / (totalTime.current / 1000);
				setFps(parseFloat(avgFPS.toFixed(1)));
				setDropped(droppedFrames.current);

				let scoreCalc = 100 - (60 - avgFPS) * 1.5 - droppedFrames.current * 2;
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

	const sendSessionReport = () => {
		const payload: Metrics = {
			fps,
			dropped,
			score,
			timestamp: Date.now(),
			url: window.location.pathname,
			userAgent: navigator.userAgent,
		};

		fetch('/api/ux-metrics', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(payload),
		});
	};

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
				onClick={sendSessionReport}
				className='bg-black text-white rounded-md px-3 py-1 text-xs hover:bg-gray-800'>
				Send Report
			</button>
			<div className='flex mt-3 h-2'>
				{Array.from({length: 30})
					.map((_, i) => {
						const t = Date.now() - i * 100;
						const recentDrop = blips.find((b) => Math.abs(b - t) < 50);
						return (
							<div
								key={i}
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
