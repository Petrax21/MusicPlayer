const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Create MusicList directory in Documents
function createMusicDirectory() {
    const documentsPath = path.join(require('os').homedir(), 'Documents');
    const musicListPath = path.join(documentsPath, 'MusicList');
    
    if (!fs.existsSync(musicListPath)) {
        fs.mkdirSync(musicListPath, { recursive: true });
        console.log('MusicList directory created:', musicListPath);
    }
    
    return musicListPath;
}

// Copy music file to MusicList directory
function copyMusicFile(sourcePath) {
    try {
        const musicListPath = createMusicDirectory();
        const fileName = path.basename(sourcePath);
        const destPath = path.join(musicListPath, fileName);
        
        // Check if file already exists
        if (fs.existsSync(destPath)) {
            return destPath; // File already exists
        }
        
        // Copy file
        fs.copyFileSync(sourcePath, destPath);
        console.log('Music file copied:', destPath);
        return destPath;
    } catch (error) {
        console.error('Error copying music file:', error);
        throw error;
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 650,
        frame: false,
        transparent: true,
        resizable: false, // Fixed size
        maximizable: false, // Disable maximize
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, 'assets/icon.ico'),
        show: false,
        minWidth: 400,
        minHeight: 650,
        maxWidth: 400,
        maxHeight: 650,
        // Add rounded corners
        hasShadow: true,
        // Set window shape for rounded corners
        titleBarStyle: 'hidden',
        // Enable window shape for custom corners
        webSecurity: false,
        // Make window truly transparent for rounded corners
        backgroundColor: '#00000000',
        // Set window shape for rounded corners
        roundedCorners: true
    });

    mainWindow.loadFile('index.html');
    
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window controls
    ipcMain.on('minimize-window', () => {
        mainWindow.minimize();
    });

    ipcMain.on('close-window', () => {
        mainWindow.close();
    });

    // Handle file operations
    ipcMain.handle('select-music-files', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Music Files', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'] }
            ]
        });
        
        if (!result.canceled) {
            const copiedFiles = [];
            for (const filePath of result.filePaths) {
                try {
                    const copiedPath = copyMusicFile(filePath);
                    copiedFiles.push({
                        originalPath: filePath,
                        copiedPath: copiedPath,
                        fileName: path.basename(filePath)
                    });
                } catch (error) {
                    console.error('Failed to copy file:', filePath, error);
                }
            }
            return copiedFiles;
        }
        return [];
    });

    ipcMain.handle('get-music-directory', () => {
        return createMusicDirectory();
    });

    ipcMain.handle('get-music-files', () => {
        const musicListPath = createMusicDirectory();
        try {
            const files = fs.readdirSync(musicListPath);
            return files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'].includes(ext);
            }).map(file => ({
                name: file,
                path: path.join(musicListPath, file)
            }));
        } catch (error) {
            console.error('Error reading music directory:', error);
            return [];
        }
    });

    // Handle opening music folder
    ipcMain.handle('open-music-folder', async () => {
        try {
            const musicListPath = createMusicDirectory();
            await shell.openPath(musicListPath);
            return { success: true, path: musicListPath };
        } catch (error) {
            console.error('Error opening music folder:', error);
            return { success: false, error: error.message };
        }
    });

    // Close window properly when close button is clicked
    mainWindow.on('close', (event) => {
        app.quit();
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
