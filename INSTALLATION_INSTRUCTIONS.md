# File System Visualizer - Installation Instructions

## For macOS Users

### Step 1: Download the Correct Version
- **Intel Mac (x64)**: Download `File System Visualizer-1.0.0.dmg`
- **Apple Silicon Mac (M1/M2/M3)**: Download `File System Visualizer-1.0.0-arm64.dmg`

*Not sure which Mac you have? Go to Apple Menu > About This Mac. If you see "Apple M1", "Apple M2", or "Apple M3", use the arm64 version. If you see "Intel", use the regular version.*

### Step 2: Install the App
1. Double-click the downloaded `.dmg` file
2. Drag the "File System Visualizer" app to your Applications folder
3. Eject the disk image

### Step 3: Run the App (Important!)
Since this app is unsigned, macOS will block it by default. Here's how to run it:

#### Method 1: Right-Click to Open
1. Go to Applications folder
2. **Right-click** on "File System Visualizer"
3. Select "Open" from the context menu
4. Click "Open" when macOS asks if you're sure
5. The app should now start normally

#### Method 2: System Preferences (If Method 1 doesn't work)
1. Try to open the app normally (it will be blocked)
2. Go to System Preferences > Security & Privacy > General
3. You'll see a message about "File System Visualizer" being blocked
4. Click "Open Anyway"
5. Try opening the app again

#### Method 3: Terminal Command (Advanced users)
```bash
sudo spctl --master-disable
```
Then open the app normally. To re-enable security afterward:
```bash
sudo spctl --master-enable
```

### Troubleshooting

**"App is damaged and can't be opened"**
- This usually happens when the file gets corrupted during download
- Try downloading the file again
- Make sure you're using the correct version for your Mac

**"App can't be opened because it's from an unidentified developer"**
- Follow Step 3 above - you need to explicitly allow the app to run

**App crashes on startup**
- Make sure you downloaded the correct version (Intel vs Apple Silicon)
- Try restarting your Mac and opening the app again
- Check Console app for error messages

**Nothing happens when opening**
- The app takes about 2-3 seconds to start up
- Check Activity Monitor to see if the process is running
- Try opening from Terminal: `open -a "File System Visualizer"`

### App Features
Once running, you can:
- Navigate your file system as an interactive graph
- Double-click folders to explore deeper
- Use the search feature (Cmd+F)
- Adjust graph physics in the settings menu
- Zoom and pan around the visualization

### Security Note
This app only **reads** your file system - it cannot modify, delete, or create files. It's completely safe to use.

---

## For the Developer

### Common Distribution Issues Fixed:
- ✅ Disabled code signing for easier distribution
- ✅ Disabled Gatekeeper assessment
- ✅ Created separate builds for Intel and Apple Silicon
- ✅ Added user instructions for running unsigned apps

### Next Steps for Production:
If you plan to distribute this widely, consider:
1. Getting an Apple Developer account for code signing
2. Implementing app notarization
3. Distributing through the Mac App Store
4. Using a service like Sparkle for auto-updates 