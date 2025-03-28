
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/animations.css'

// Add custom hover effect styles
const styleElement = document.createElement('style');
styleElement.textContent = `
  .view-profile-btn:hover {
    background-color: white !important;
    color: black !important;
    transition: all 0.2s ease;
  }
`;
document.head.appendChild(styleElement);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
