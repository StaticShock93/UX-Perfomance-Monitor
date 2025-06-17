import {useState, useEffect} from 'react';
import {UXMonitorOverlay} from './UXMonitorOverlay';

export function UXMonitorToggle() {
	const [visible, setVisible] = useState(true);

	// Hotkey: Ctrl + Shift + M
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
				setVisible((current) => !current);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, []);

	return (
		<>
			<div
				style={{
					position: 'fixed',
					top: '1rem',
					right: '1rem',
					zIndex: 9999,
				}}>
				<button
					onClick={() => setVisible((prev) => !prev)}
					style={{
						backgroundColor: '#111827',
						color: 'white',
						padding: '0.5rem 1rem',
						borderRadius: '0.375rem',
						boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
						cursor: 'pointer',
						transition: 'background-color 0.3s ease',
						border: 'none',
						fontSize: '0.875rem',
					}}
					onMouseEnter={(e) =>
						(e.currentTarget.style.backgroundColor = '#374151')
					}
					onMouseLeave={(e) =>
						(e.currentTarget.style.backgroundColor = '#111827')
					}>
					{visible ? 'Hide Monitor' : 'Show Monitor'}
				</button>
			</div>

			{/* Overlay */}
			{visible && <UXMonitorOverlay onClose={() => setVisible(false)} />}
		</>
	);
}
