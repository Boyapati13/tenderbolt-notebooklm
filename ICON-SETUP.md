# Windows App Icon Setup

To create a proper Windows icon for your desktop app:

## Option 1: Convert Existing Logo
1. Use your existing `syntara-logo.svg`
2. Convert to `.ico` format using online tools:
   - https://convertio.co/svg-ico/
   - https://www.icoconverter.com/
3. Save as `public/syntara-icon.ico`

## Option 2: Create New Icon
1. Design a 256x256 pixel icon
2. Include multiple sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
3. Save as `.ico` format
4. Place in `public/syntara-icon.ico`

## Icon Requirements
- **Format**: .ico (Windows icon format)
- **Sizes**: Multiple resolutions (16px to 256px)
- **Design**: Clear, recognizable at small sizes
- **Branding**: Consistent with Syntara brand

## Quick Setup
If you don't have an icon ready, the app will use a default Electron icon.
You can add a custom icon later by:
1. Creating the .ico file
2. Rebuilding the app
3. The installer will automatically use the new icon
