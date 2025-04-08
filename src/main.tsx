
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

// Initialize theme from localStorage or system preference before rendering
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.classList.add(savedTheme);
  } else if (prefersDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.add('light');
  }
};

initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
