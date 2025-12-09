import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Clear old mockup data from localStorage
localStorage.removeItem('pm2_projects');
localStorage.removeItem('pm2_task_types');
localStorage.removeItem('pm2_task_instances');
localStorage.removeItem('pm2_action_types');
localStorage.removeItem('pm2_event_source_types');
localStorage.removeItem('pm2_event_types');

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <App />
        </HashRouter>
    </StrictMode>,
)
