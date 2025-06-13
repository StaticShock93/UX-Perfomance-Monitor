// backend/server.ts
import express, {Request, Response} from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

interface MetricsPayload {
	fps: number;
	dropped: number;
	score: number;
	timestamp: number;
	url: string;
	userAgent: string;
}

app.post(
	'/api/ux-metrics',
	(req: Request<{}, {}, MetricsPayload>, res: Response) => {
		const metrics = req.body;
		console.log('📊 UX Metrics Report Received:', metrics);
		res.status(200).json({message: 'Metrics received successfully'});
	}
);

app.listen(PORT, () => {
	console.log(`🚀 UX Monitor API running on http://localhost:${PORT}`);
});
