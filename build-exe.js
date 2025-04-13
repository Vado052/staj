
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're on Windows
if (process.platform !== 'win32') {
  console.error('This script should only be run on Windows');
  process.exit(1);
}

// Check for npm
try {
  execSync('npm --version');
} catch (error) {
  console.error('npm is required but not found');
  process.exit(1);
}

console.log('Installing required packages...');

try {
  // Install electron and electron-builder if not already installed
  execSync('npm list electron || npm install --save-dev electron@latest');
  execSync('npm list electron-builder || npm install --save-dev electron-builder@latest');
  
  // Create electron main.js file if it doesn't exist
  const mainJsPath = path.join(__dirname, 'electron-main.js');
  if (!fs.existsSync(mainJsPath)) {
    console.log('Creating electron main.js file...');
    fs.writeFileSync(mainJsPath, `
      const { app, BrowserWindow } = require('electron');
      const path = require('path');

      let mainWindow;

      function createWindow() {
        mainWindow = new BrowserWindow({
          width: 1200,
          height: 800,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
          },
          title: "Калькулятор стажа работы"
        });

        mainWindow.setMenu(null);
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
      }

      app.whenReady().then(() => {
        createWindow();
        
        app.on('activate', function () {
          if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
      });

      app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') app.quit();
      });
    `);
  }

  // Create electron-builder config if it doesn't exist
  const builderConfigPath = path.join(__dirname, 'electron-builder.json');
  if (!fs.existsSync(builderConfigPath)) {
    console.log('Creating electron-builder configuration...');
    fs.writeFileSync(builderConfigPath, JSON.stringify({
      "appId": "com.calculator.workexperience",
      "productName": "Калькулятор стажа работы",
      "directories": {
        "output": "electron-dist"
      },
      "files": [
        "dist/**/*",
        "electron-main.js"
      ],
      "win": {
        "target": "nsis",
        "icon": "public/favicon.ico"
      },
      "nsis": {
        "oneClick": false,
        "allowToChangeInstallationDirectory": true,
        "createDesktopShortcut": true,
        "createStartMenuShortcut": true
      }
    }, null, 2));
  }

  // Add electron build scripts to package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts['electron:start']) {
    packageJson.scripts['electron:start'] = 'electron electron-main.js';
    packageJson.scripts['electron:build'] = 'electron-builder --win';
    packageJson.main = 'electron-main.js';
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Added Electron build scripts to package.json');
  }

  // Build the Vite app
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Build the electron app
  console.log('Building Windows executable installer...');
  execSync('npm run electron:build', { stdio: 'inherit' });

  console.log('Done! The .exe installer should be in the electron-dist folder.');
} catch (error) {
  console.error('Error building the Windows executable:', error.message);
  process.exit(1);
}
