
#!/bin/bash

# Упрощенный скрипт сборки с фокусом на VS2022

# Устанавливаем рабочую директорию
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Сборка веб-приложения
npm ci
npm run build

# Проверка платформы и сборка соответствующих пакетов
if [ "$(uname)" == "MINGW"* ] || [ "$(uname)" == "MSYS"* ] || [ "$(uname)" == "CYGWIN"* ]; then
  echo "Обнаружена Windows, создание проекта для Visual Studio 2022..."
  node build-exe.js
else
  echo "Создание проекта для Visual Studio 2022..."
  node build-exe.js
fi

# Создание bat-файла для удобного открытия в Visual Studio
echo "Создание ярлыка для Visual Studio..."
echo '@echo off
echo Открытие проекта в Visual Studio 2022...
start "" "vs-project\\ExperienceCalculator.sln"' > open-in-vs.bat
chmod +x open-in-vs.bat
echo "Вы можете открыть проект в Visual Studio, запустив open-in-vs.bat"

echo "Сборка завершена!"
