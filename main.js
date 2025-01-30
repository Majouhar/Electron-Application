const { app, Tray, Menu, BrowserWindow } = require('electron');
const path = require('path');
const axios = require('axios');
const os = require('os');

let tray = null;
let mainWindow = null;
let iconIndex = 0;
const icons = [
  path.join(__dirname, "assets", 'icon1.png'), // Replace with actual icon paths
  path.join(__dirname, "assets", 'icon2.png'),
  path.join(__dirname, "assets", 'icon3.png'),
];

// Fetch GitHub user details
async function fetchGitHubUser(username) {
  const url = `https://api.github.com/users/${username}`;
  try {
    const response = await axios.get(url);
    changeTrayIcon()
    return response.data;

  } catch (error) {
    console.error('Error fetching GitHub user details:', error);
    return null;
  }
}

// Change tray icon
function changeTrayIcon() {
  if (tray) {
    iconIndex = (iconIndex + 1) % icons.length;
    tray.setImage(icons[iconIndex]);
  }
}

// Create the main GUI window
function createMainWindow() {
  if (mainWindow) {
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "assets", 'preload.js'),
    },
  });

  // Load the external HTML file
  mainWindow.loadFile(path.join(__dirname, "assets", 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize the app
app.whenReady().then(() => {
  tray = new Tray(icons[iconIndex]);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open GUI',
      click: async () => {
        createMainWindow();
        const userData = await fetchGitHubUser('Majouhar'); // Replace with desired username
        const osUsername = os.userInfo().username;
        mainWindow.webContents.send('user-data', { userData, osUsername });
      },
    },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setToolTip('Electron Tray App');
  tray.setContextMenu(contextMenu);

  // tray.on('click', async () => {
  //   createMainWindow();
  //   const userData = await fetchGitHubUser('Majouhar'); // Replace with desired username
  //   mainWindow.webContents.send('user-data',  { userData, osUsername });
  // });

  // Force tray icon to be displayed outside the taskbar like OneDrive (Windows-specific)
  if (process.platform === 'win32') {
    tray.setContextMenu(null);  // Remove context menu to avoid taskbar interference
  }


});

app.on('window-all-closed', () => {
  // Do nothing to keep the tray icon active
});
