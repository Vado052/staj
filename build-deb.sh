
#!/bin/bash

# Install required packages
echo "Installing required packages..."
sudo apt-get update
sudo apt-get install -y debhelper devscripts npm

# Build the application
echo "Building the application..."
npm ci
npm run build

# Create .deb package
echo "Creating Debian package..."
dpkg-buildpackage -us -uc -b

echo "Done! The .deb package should be created in the parent directory."
