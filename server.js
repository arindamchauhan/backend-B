import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

const { default: createApp } = await import('./app.js');

const app = createApp();
const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
