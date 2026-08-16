const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, "build/icon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "Outro Cérebro",
    autoHideMenuBar: true,
  });

  // Load the live site
  mainWindow.loadURL("https://outrocerebro.com.br");

  // Open external links in the default browser instead of the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith("https://outrocerebro.com.br")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
