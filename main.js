const path = require('path');
const { app, BrowserWindow } = require('electron');
const electronReload = require('electron-reload');

electronReload(__dirname, {});

const createWindow = () => {
    const win = new BrowserWindow({
        width: 820,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadFile('index.html');
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
