import 'bootstrap/dist/css/bootstrap.css';
import "./assets/css/Index.css"; 
 
import { createRoot } from 'react-dom/client'; 
import App from './components/App';
import registerServiceWorker from './helpers/registerServiceWorker';
 
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

registerServiceWorker(); 