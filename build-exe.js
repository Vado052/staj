
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Проверка наличия необходимых инструментов
console.log('Проверка наличия инструментов для сборки...');

try {
  const vsProjectPath = path.join(__dirname, 'vs-project');
  
  // Создание директории проекта, если её нет
  if (!fs.existsSync(vsProjectPath)) {
    console.log('Создание директории проекта...');
    fs.mkdirSync(vsProjectPath, { recursive: true });
  }
    
  // Создание файла решения
  const slnPath = path.join(vsProjectPath, 'ExperienceCalculator.sln');
  if (!fs.existsSync(slnPath)) {
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
  }
    
  // Создание директории проекта
  const projectDir = path.join(vsProjectPath, 'ExperienceCalculator');
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
  }
    
  // Создание файла проекта
  const csprojPath = path.join(projectDir, 'ExperienceCalculator.csproj');
  if (!fs.existsSync(csprojPath)) {
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
  }
    
  // Создание файла иконки приложения
  const iconPath = path.join(projectDir, 'app-icon.ico');
  if (!fs.existsSync(iconPath)) {
    try {
      // Копируем favicon.ico в папку проекта как app-icon.ico
      const publicFaviconPath = path.join(__dirname, 'public', 'favicon.ico');
      if (fs.existsSync(publicFaviconPath)) {
        console.log('Копирование файла иконки...');
        fs.copyFileSync(publicFaviconPath, iconPath);
      } else {
        console.log('Файл иконки не найден, создаем пустой файл иконки');
        fs.writeFileSync(iconPath, '');
      }
    } catch (iconError) {
      console.log('Не удалось скопировать иконку, создаем пустой файл иконки');
      fs.writeFileSync(iconPath, '');
    }
  }
    
  // Создание файла программы
  const programPath = path.join(projectDir, 'Program.cs');
  if (!fs.existsSync(programPath)) {
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
            
            try {
                if (File.Exists("app-icon.ico")) {
                    this.Icon = new System.Drawing.Icon("app-icon.ico");
                }
            } catch (Exception ex) {
                Console.WriteLine($"Не удалось загрузить иконку: {ex.Message}");
            }
            
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

            try
            {
                if (Directory.Exists(wwwDir) && File.Exists(indexPath))
                {
                    await webView.EnsureCoreWebView2Async(null);
                    webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                        "calculator.local", wwwDir, CoreWebView2HostResourceAccessKind.Allow);
                    webView.CoreWebView2.Navigate("https://calculator.local/index.html");
                }
                else
                {
                    MessageBox.Show($"Не удалось найти файл: {indexPath}\\n\\nПожалуйста, убедитесь, что вы выполнили сборку веб-приложения командой 'npm run build' перед запуском.", 
                        "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Произошла ошибка при инициализации WebView2: {ex.Message}\\n\\nУбедитесь, что установлен Microsoft Edge WebView2 Runtime.", 
                    "Ошибка", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
    `.trim());
  }

  // Создание VS_README.md с подробными инструкциями
  const vsReadmePath = path.join(__dirname, 'VS_README.md');
  if (!fs.existsSync(vsReadmePath)) {
    console.log('Создание файла с инструкциями...');
    fs.writeFileSync(vsReadmePath, `
# Запуск проекта в Visual Studio 2022

## Предварительные требования

1. Visual Studio 2022 (Community, Professional или Enterprise)
2. .NET SDK 6.0 или выше
3. Компонент "Разработка классических приложений .NET" в Visual Studio
4. Компонент "Разработка для UWP" в Visual Studio (для WebView2)
5. Microsoft Edge WebView2 Runtime (устанавливается автоматически с Visual Studio 2022)

## Порядок действий для открытия проекта

### Способ 1: Через BAT-файл (рекомендуется)
1. Запустите файл \`open-in-vs.bat\` в корне проекта

### Способ 2: Вручную
1. Откройте Visual Studio 2022
2. Выберите "Открыть проект или решение"
3. Найдите и откройте файл \`vs-project/ExperienceCalculator.sln\`

## Первый запуск

1. Соберите веб-приложение командой \`npm run build\`
2. В Visual Studio нажмите F5 или кнопку "Пуск" для запуска проекта

## Устранение проблем

Если у вас возникают сложности с открытием проекта:

1. Убедитесь, что установлена Visual Studio 2022 с компонентами:
   - "Разработка классических приложений .NET"
   - "Разработка для UWP"
   
2. Проверьте наличие .NET SDK 6.0 или выше:
   - Откройте командную строку и выполните \`dotnet --version\`
   - Версия должна быть 6.0.x или выше

3. Установите Microsoft Edge WebView2 Runtime с сайта Microsoft

4. Если проект не открывается, удалите папку \`vs-project\` и заново запустите \`open-in-vs.bat\`
`.trim());
  }

  console.log('Проект для Visual Studio успешно создан!');
  console.log('Вы можете открыть проект, запустив файл open-in-vs.bat');

} catch (error) {
  console.error('Ошибка при создании проекта:', error.message);
  console.error('Пожалуйста, убедитесь, что у вас есть права на запись в директорию проекта');
  console.error('и установлен .NET SDK 6.0 или выше.');
  process.exit(1);
}
