import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from './config/db';

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/leadflow';

async function bootstrap(): Promise<void> {
  try {
    await connectDB(MONGO_URI);
    console.log('[db] connected');

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[bootstrap] failed to start:', err);
    process.exit(1);
  }
}

bootstrap();
