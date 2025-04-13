
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

  // Create Visual Studio solution and project files
  const vsProjectPath = path.join(__dirname, 'vs-project');
  if (!fs.existsSync(vsProjectPath)) {
    fs.mkdirSync(vsProjectPath, { recursive: true });
    
    // Create solution file
    const slnPath = path.join(vsProjectPath, 'ExperienceCalculator.sln');
    console.log('Creating Visual Studio solution file...');
    fs.writeFileSync(slnPath, `
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.31903.59
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "ExperienceCalculator", "ExperienceCalculator\\ExperienceCalculator.csproj", "{GUID-1}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
	GlobalSection(SolutionProperties) = preSolution
		HideSolutionNode = FALSE
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution
		{GUID-1}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{GUID-1}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{GUID-1}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{GUID-1}.Release|Any CPU.Build.0 = Release|Any CPU
	EndGlobalSection
EndGlobal
    `.trim().replace('{GUID-1}', '12345678-1234-1234-1234-123456789ABC'));
    
    // Create project directory
    const projectDir = path.join(vsProjectPath, 'ExperienceCalculator');
    fs.mkdirSync(projectDir, { recursive: true });
    
    // Create csproj file
    const csprojPath = path.join(projectDir, 'ExperienceCalculator.csproj');
    console.log('Creating C# project file...');
    fs.writeFileSync(csprojPath, `
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net6.0-windows</TargetFramework>
    <UseWindowsForms>true</UseWindowsForms>
    <UseWPF>true</UseWPF>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <None Include="..\\..\\dist\\**">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <Link>www\\%(RecursiveDir)%(Filename)%(Extension)</Link>
    </None>
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.Web.WebView2" Version="1.0.1264.42" />
  </ItemGroup>
</Project>
    `.trim());
    
    // Create Program.cs
    const programPath = path.join(projectDir, 'Program.cs');
    console.log('Creating C# program file...');
    fs.writeFileSync(programPath, `
using System;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace ExperienceCalculator
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }

    public class MainForm : Form
    {
        private WebView2 webView;

        public MainForm()
        {
            this.Text = "Калькулятор стажа работы";
            this.Size = new System.Drawing.Size(1200, 800);
            
            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            this.Controls.Add(webView);

            this.Load += MainForm_Load;
        }

        private async void MainForm_Load(object sender, EventArgs e)
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            string wwwDir = Path.Combine(appDir, "www");
            string indexPath = Path.Combine(wwwDir, "index.html");

            if (File.Exists(indexPath))
            {
                await webView.EnsureCoreWebView2Async(null);
                webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "calculator.local", wwwDir, CoreWebView2HostResourceAccessKind.Allow);
                webView.CoreWebView2.Navigate("https://calculator.local/index.html");
            }
            else
            {
                MessageBox.Show($"Не удалось найти файл: {indexPath}", "Ошибка", 
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
                this.Close();
            }
        }
    }
}
    `.trim());
  }

  // Add Visual Studio build scripts to package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts['electron:start']) {
    packageJson.scripts['electron:start'] = 'electron electron-main.js';
    packageJson.scripts['electron:build'] = 'electron-builder --win';
    packageJson.main = 'electron-main.js';
  }
  
  if (!packageJson.scripts['vs:build']) {
    packageJson.scripts['vs:build'] = 'cd vs-project && dotnet build ExperienceCalculator.sln';
    packageJson.scripts['vs:run'] = 'cd vs-project && dotnet run --project ExperienceCalculator/ExperienceCalculator.csproj';
    packageJson.scripts['vs:publish'] = 'cd vs-project && dotnet publish ExperienceCalculator.sln -c Release -o ../vs-dist';
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Added Visual Studio build scripts to package.json');

  // Create batch file to open in Visual Studio
  const openVsPath = path.join(__dirname, 'open-in-vs.bat');
  console.log('Creating batch file to open in Visual Studio...');
  fs.writeFileSync(openVsPath, `
@echo off
start "" "vs-project\\ExperienceCalculator.sln"
  `.trim());

  // Build the Vite app
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });

  // Build Visual Studio project
  console.log('Building Visual Studio project...');
  try {
    execSync('npm run vs:build', { stdio: 'inherit' });
    console.log('Done! The Visual Studio project is ready.');
    console.log('You can open the solution in Visual Studio 2022 by running open-in-vs.bat');
  } catch (vsError) {
    console.error('Error building Visual Studio project:', vsError.message);
    console.log('Make sure you have .NET SDK 6.0 or later installed.');
  }

  // Still build the electron app as a fallback
  console.log('Building Windows executable installer...');
  execSync('npm run electron:build', { stdio: 'inherit' });
  console.log('Done! The .exe installer is in the electron-dist folder.');
} catch (error) {
  console.error('Error in build process:', error.message);
  process.exit(1);
}

