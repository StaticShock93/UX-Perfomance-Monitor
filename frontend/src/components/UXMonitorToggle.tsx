// UXMonitorToggle.tsx
import {useState, useEffect} from 'react';
import UXMonitorOverlay from './UXMonitorOverlay';

export default function UXMonitorToggle() {
	const [visible, setVisible] = useState(false);

	// Hotkey: Ctrl + Shift + M
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
				setVisible((v) => !v);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	return (
		<>
			{/* <div className='fixed top-16 right-4 z-50 bg-white p-1 text-xs border'>
				Monitor Visible: {visible ? 'Yes' : 'No'}
			</div> */}

			{/* Toggle Button */}
			<div className='fixed top-4 right-4 z-50'>
				<button
					onClick={() => setVisible((v) => !v)}
					className='bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg hover:bg-gray-700 transition cursor-pointer'>
					{visible ? 'Hide Monitor' : 'Show Monitor'}
				</button>
			</div>

			{/* Overlay */}
			{visible && <UXMonitorOverlay onClose={() => setVisible(false)} />}
		</>
	);
}
