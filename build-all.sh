
#!/bin/bash

# Build both .deb and .exe installers, plus Visual Studio project

# Set the working directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Build the web application
npm ci
npm run build

# Check platform and build appropriate packages
if [ "$(uname)" == "Linux" ]; then
  echo "Building .deb package..."
  bash build-deb.sh

  if command -v node &> /dev/null; then
    echo "Building Windows .exe package (requires WSL or Wine)..."
    node build-exe.js
  else
    echo "Node.js not found, skipping Windows .exe build"
  fi
elif [ "$(uname)" == "MINGW"* ] || [ "$(uname)" == "MSYS"* ] || [ "$(uname)" == "CYGWIN"* ]; then
  echo "Windows detected, building .exe package and Visual Studio project..."
  node build-exe.js
  echo "Note: Building .deb package requires a Linux environment"
else
  echo "Unsupported platform for direct building of packages."
  echo "You can manually run build-deb.sh on Linux or build-exe.js on Windows."
fi

# Create a batch file to make it easy to open in Visual Studio
if [ "$(uname)" == "MINGW"* ] || [ "$(uname)" == "MSYS"* ] || [ "$(uname)" == "CYGWIN"* ]; then
  echo "Creating Visual Studio launcher..."
  echo '@echo off
start "" "vs-project\\ExperienceCalculator.sln"' > open-in-vs.bat
  chmod +x open-in-vs.bat
  echo "You can open the project in Visual Studio by running open-in-vs.bat"
fi

echo "Build process completed!"

