# 🖥️ Syntara Tenders AI - Windows Desktop App

Transform your Syntara Tenders AI web application into a native Windows desktop application using Electron.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
Run the automated setup script:

```bash
# Windows Command Prompt
setup-desktop.bat

# PowerShell
.\setup-desktop.ps1
```

### Option 2: Manual Setup
Follow these steps manually:

1. **Install Dependencies**
   ```bash
   npm install electron electron-builder concurrently wait-on electron-is-dev --save-dev
   ```

2. **Build the App**
   ```bash
   npm run build:desktop
   ```

3. **Create Windows Installer**
   ```bash
   npm run electron-pack
   ```

## 📦 What You Get

After running the setup, you'll have:

- **Windows Installer**: `dist/Syntara Tenders AI Setup.exe`
- **Portable App**: `dist/win-unpacked/` folder
- **Native Windows App**: Full desktop application experience

## 🎯 Features

### Desktop App Features
- ✅ **Native Windows Integration**
- ✅ **Desktop Shortcuts** (Start Menu & Desktop)
- ✅ **System Tray Support**
- ✅ **Offline Capability**
- ✅ **Auto-Updates** (configurable)
- ✅ **Professional Installer**

### App Capabilities
- ✅ **Full Tender Management**
- ✅ **AI-Powered Analysis**
- ✅ **Document Processing**
- ✅ **Team Collaboration**
- ✅ **Analytics & Reporting**
- ✅ **Third-Party Integrations**

## 🔧 Configuration

### Electron Configuration
The app is configured with:
- **Window Size**: 1400x900 (minimum 1200x700)
- **Security**: Context isolation enabled
- **Performance**: Optimized for desktop use
- **Icon**: Syntara logo integration

### Build Configuration
- **Target**: Windows NSIS installer
- **Architecture**: x64 (64-bit)
- **Auto-updater**: Ready for implementation
- **Code Signing**: Ready for certificate

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10 (64-bit) or later
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Network**: Internet connection for AI features

### Recommended Requirements
- **OS**: Windows 11 (64-bit)
- **RAM**: 16GB or more
- **Storage**: 2GB free space
- **CPU**: Intel i5 or AMD Ryzen 5 or better

## 🛠️ Development

### Development Mode
Run the app in development mode with hot reload:

```bash
npm run electron-dev
```

This will:
1. Start the Next.js development server
2. Launch Electron with the dev server
3. Enable DevTools for debugging

### Building for Production
```bash
npm run build:desktop
npm run electron-pack
```

## 📁 File Structure

```
├── electron/
│   └── main.js              # Electron main process
├── dist/                    # Built application
│   ├── Syntara Tenders AI Setup.exe
│   └── win-unpacked/        # Portable version
├── out/                     # Next.js static export
├── package-desktop.json     # Desktop-specific config
├── next.config.desktop.ts   # Desktop Next.js config
├── setup-desktop.bat        # Windows batch setup
└── setup-desktop.ps1        # PowerShell setup
```

## 🔒 Security Features

- **Context Isolation**: Prevents Node.js access from renderer
- **Remote Module Disabled**: Enhanced security
- **Web Security**: Standard web security enabled
- **External Link Handling**: Safe external link opening

## 🚀 Distribution

### For End Users
1. **Download**: The installer from `dist/` folder
2. **Install**: Run `Syntara Tenders AI Setup.exe`
3. **Launch**: Find the app in Start Menu or Desktop

### For Developers
1. **Code Signing**: Add certificate for trusted installation
2. **Auto-Updater**: Implement update mechanism
3. **Store Distribution**: Package for Microsoft Store

## 🐛 Troubleshooting

### Common Issues

**App won't start:**
- Check Windows version compatibility
- Ensure all dependencies are installed
- Run as administrator if needed

**Build fails:**
- Clear `node_modules` and reinstall
- Check Node.js version (16+ required)
- Ensure sufficient disk space

**Installer issues:**
- Disable antivirus temporarily
- Run installer as administrator
- Check Windows security settings

## 📞 Support

For issues with the desktop app:
1. Check the troubleshooting section
2. Review Electron documentation
3. Contact development team

## 🔄 Updates

The desktop app can be updated by:
1. Rebuilding with new code
2. Running the installer again
3. Implementing auto-updater (future feature)

---

**🎉 Enjoy your native Windows desktop experience with Syntara Tenders AI!**
