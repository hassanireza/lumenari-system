import { createRoot } from 'react-dom/client';
import App from './App';
import './style.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/400-italic.css';

createRoot(document.getElementById('root')!).render(<App />);
