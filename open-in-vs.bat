
@echo off
echo Открытие проекта в Visual Studio 2022...

:: Проверка наличия папки проекта
if not exist "vs-project" (
  echo Создание проекта Visual Studio...
  node build-exe.js
)

:: Проверка наличия файла решения
if exist "vs-project\ExperienceCalculator.sln" (
  echo Открытие решения Visual Studio...
  start "" "vs-project\ExperienceCalculator.sln"
) else (
  echo Файл решения не найден. Пробуем пересоздать проект...
  node build-exe.js
  
  if exist "vs-project\ExperienceCalculator.sln" (
    echo Открытие созданного решения...
    start "" "vs-project\ExperienceCalculator.sln"
  ) else (
    echo ОШИБКА: Не удалось создать решение Visual Studio.
    echo.
    echo Возможные причины:
    echo 1. Не установлен .NET SDK 6.0 или выше
    echo 2. Не установлена Visual Studio 2022
    echo 3. Проблемы с правами доступа к папке
    echo.
    echo Пожалуйста, проверьте установку Visual Studio 2022 и .NET SDK.
    pause
  )
)
