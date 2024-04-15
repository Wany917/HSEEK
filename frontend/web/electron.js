import { app, BrowserWindow } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';

function createWindow() {
  // Créer la fenêtre du navigateur.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(process.cwd(), 'app/preload.js'), // Assurez-vous que le chemin est correct
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Charger l'URL du serveur de développement Vite ou le fichier build pour la production
  const url = isDev ? 'http://localhost:5173' : `file://${path.join(process.cwd(), 'dist/index.html')}`;
  win.loadURL(url);
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

