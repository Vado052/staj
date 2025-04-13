
@echo off
if exist "vs-project\ExperienceCalculator.sln" (
  echo Opening solution in Visual Studio 2022...
  start "" "vs-project\ExperienceCalculator.sln"
) else (
  echo Building Visual Studio project first...
  node build-exe.js
  if exist "vs-project\ExperienceCalculator.sln" (
    echo Opening solution in Visual Studio 2022...
    start "" "vs-project\ExperienceCalculator.sln"
  ) else (
    echo Failed to create Visual Studio solution. Check for errors.
    pause
  )
)
