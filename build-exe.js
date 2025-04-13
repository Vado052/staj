
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Проверка наличия npm
try {
  execSync('npm --version');
} catch (error) {
  console.error('npm не найден, но требуется для сборки');
  process.exit(1);
}

console.log('Установка необходимых пакетов...');

try {
  // Создание проекта Visual Studio
  const vsProjectPath = path.join(__dirname, 'vs-project');
  if (!fs.existsSync(vsProjectPath)) {
    fs.mkdirSync(vsProjectPath, { recursive: true });
    
    // Создание файла решения
    const slnPath = path.join(vsProjectPath, 'ExperienceCalculator.sln');
    console.log('Создание файла решения Visual Studio...');
    fs.writeFileSync(slnPath, `
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.0.31903.59
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "ExperienceCalculator", "ExperienceCalculator\\ExperienceCalculator.csproj", "{12345678-1234-1234-1234-123456789ABC}"
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
		{12345678-1234-1234-1234-123456789ABC}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{12345678-1234-1234-1234-123456789ABC}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{12345678-1234-1234-1234-123456789ABC}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{12345678-1234-1234-1234-123456789ABC}.Release|Any CPU.Build.0 = Release|Any CPU
	EndGlobalSection
EndGlobal
    `.trim());
    
    // Создание директории проекта
    const projectDir = path.join(vsProjectPath, 'ExperienceCalculator');
    fs.mkdirSync(projectDir, { recursive: true });
    
    // Создание файла проекта
    const csprojPath = path.join(projectDir, 'ExperienceCalculator.csproj');
    console.log('Создание файла C# проекта...');
    fs.writeFileSync(csprojPath, `
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net6.0-windows</TargetFramework>
    <UseWindowsForms>true</UseWindowsForms>
    <UseWPF>true</UseWPF>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <ApplicationIcon>app-icon.ico</ApplicationIcon>
    <Authors>Калькулятор стажа работы</Authors>
    <Product>Калькулятор стажа работы</Product>
    <Description>Приложение для расчета стажа работы с учетом коэффициентов</Description>
  </PropertyGroup>
  <ItemGroup>
    <None Include="..\\..\\dist\\**">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
      <Link>www\\%(RecursiveDir)%(Filename)%(Extension)</Link>
    </None>
  </ItemGroup>
  <ItemGroup>
    <Content Include="app-icon.ico">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </Content>
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.Web.WebView2" Version="1.0.1264.42" />
  </ItemGroup>
</Project>
    `.trim());
    
    // Создание файла иконки приложения
    const iconPath = path.join(projectDir, 'app-icon.ico');
    try {
      // Копируем favicon.ico в папку проекта как app-icon.ico
      fs.copyFileSync(path.join(__dirname, 'public', 'favicon.ico'), iconPath);
    } catch (iconError) {
      console.log('Не удалось скопировать иконку, создаем пустой файл иконки');
      fs.writeFileSync(iconPath, '');
    }
    
    // Создание файла программы
    const programPath = path.join(projectDir, 'Program.cs');
    console.log('Создание файла C# программы...');
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
            this.MinimumSize = new System.Drawing.Size(800, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.Icon = new System.Drawing.Icon("app-icon.ico", 16, 16);
            
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

  // Добавление скриптов сборки Visual Studio в package.json
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts['vs:build']) {
    packageJson.scripts['vs:build'] = 'cd vs-project && dotnet build ExperienceCalculator.sln';
    packageJson.scripts['vs:run'] = 'cd vs-project && dotnet run --project ExperienceCalculator/ExperienceCalculator.csproj';
    packageJson.scripts['vs:publish'] = 'cd vs-project && dotnet publish ExperienceCalculator.sln -c Release -o ../vs-dist';
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Добавлены скрипты сборки Visual Studio в package.json');

  // Сборка Vite приложения если еще не собрано
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('Сборка веб-приложения...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // Сборка проекта Visual Studio
  console.log('Сборка проекта Visual Studio...');
  try {
    execSync('npm run vs:build', { stdio: 'inherit' });
    console.log('Готово! Проект Visual Studio успешно создан.');
    console.log('Вы можете открыть проект в Visual Studio 2022, запустив open-in-vs.bat');
  } catch (vsError) {
    console.error('Ошибка при сборке проекта Visual Studio:', vsError.message);
    console.log('Убедитесь, что у вас установлен .NET SDK 6.0 или выше.');
  }

} catch (error) {
  console.error('Ошибка в процессе сборки:', error.message);
  process.exit(1);
}
