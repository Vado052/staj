
@echo off
echo Открытие проекта в Visual Studio 2022...

if exist "vs-project\ExperienceCalculator.sln" (
  echo Открытие существующего решения...
  start "" "vs-project\ExperienceCalculator.sln"
) else (
  echo Создание проекта Visual Studio...
  node build-exe.js
  if exist "vs-project\ExperienceCalculator.sln" (
    echo Открытие созданного решения...
    start "" "vs-project\ExperienceCalculator.sln"
  ) else (
    echo Ошибка: Не удалось создать решение для Visual Studio.
    echo Проверьте, установлен ли .NET SDK 6.0+
    pause
  )
)
