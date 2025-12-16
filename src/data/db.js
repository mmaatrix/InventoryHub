import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'inventory.json');

// Initialize DB file if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
}

export default {
  read: () => {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading DB:', err);
      return [];
    }
  },
  write: (data) => {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error writing DB:', err);
    }
  }
};
