# Money Minder 💰

A comprehensive personal finance management mobile application built with React Native and Expo. Money Minder helps you track your expenses, manage your budget, and gain insights into your spending habits.

## 📱 Features

- **Expense Tracking and Income Tracking**: Record and categorize your daily expenses and income
- ![WhatsApp Image 2025-09-21 at 19 50 08_030ab692](https://github.com/user-attachments/assets/85f74d4f-6ac5-4c47-8fba-e64cb2cee15e)

- **Budget Management**: Set and monitor monthly budgets
- ![WhatsApp Image 2025-09-21 at 19 50 08_08d76287](https://github.com/user-attachments/assets/36642485-8a66-4b3f-b563-6d28ce7cafe0)

- **Note Management**: Keep your  special notes
- ![WhatsApp Image 2025-09-21 at 19 50 07_cc5f32d0](https://github.com/user-attachments/assets/a76bf8d4-6142-47ae-be54-8dc12878530d)

- **Financial Analytics**: Visual charts and reports of your financial data
- ![WhatsApp Image 2025-09-21 at 19 50 08_da623c59](https://github.com/user-attachments/assets/b961a2b3-392a-4800-a4e0-499dfc88c586)

- **Category Management**: Organize transactions by custom categories
- ![WhatsApp Image 2025-09-21 at 19 50 07_0397cd2a](https://github.com/user-attachments/assets/f238500a-dd67-4e26-8ccf-db356be93529)

- - **Month Picker**: Filter transactions by month / Filter notes by month
- ![WhatsApp Image 2025-09-21 at 19 50 06_43cdd35d](https://github.com/user-attachments/assets/ba444a6e-4642-4e47-bc74-08f2dcd0a686)
- ![WhatsApp Image 2025-09-21 at 17 26 14_e61bec0e](https://github.com/user-attachments/assets/d21b3401-c184-48ed-8b83-0bbe93b20a58)



## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK
- **Language**: JavaScript/TypeScript
- **Navigation**: Expo Router (File-based routing)
- **Database**: Firestore
- **UI Components**: React Native built-in components
- **Charts**: React Native chart libraries
- **Development**: Expo CLI and Expo Go

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your development machine:

### Required Software:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Expo CLI**: `npm install -g @expo/cli`
- **Git** for version control

### For Development:
- **Expo Go app** on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Development Tools (Recommended):
- **VS Code** with React Native extensions
- **React Developer Tools**
- **Expo Dev Tools**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sandumidilthara/Money---Minder.git
cd Money---Minder
```

### 2. Install Dependencies
```bash
# Install all project dependencies
npm install
# or if you prefer yarn
yarn install
```


## 🏃‍♂️ Running the App

### Start the Development Server
```bash
# Start the Expo development server
npx expo start
# or
npm start
# or
yarn start
```

After running this command, you'll see a QR code in your terminal and a development server will open in your browser.

### Run on Physical Device
1. Install **Expo Go** app on your mobile device
2. Scan the QR code with:
   - **iOS**: Camera app or Expo Go app
   - **Android**: Expo Go app
3. The app will load and run on your device

### Run on Emulator/Simulator

#### Android Emulator:
```bash
# Make sure Android Studio and emulator are running
npx expo start --android
# or press 'a' in the terminal after running npx expo start
```
 
### Run on Web (if supported):
```bash
npx expo start --web
# or press 'w' in the terminal after running npx expo start
```

## 🧪 Testing

### Run Tests
```bash
# Run unit tests
npm test
# or
yarn test

# Run tests in watch mode
npm test -- --watch
```

 
## 🏗️ Building for Production

### Using Expo Build Service (EAS)

#### 1. Install EAS CLI:
```bash
npm install -g eas-cli
```

#### 2. Login to Expo:
```bash
eas login
```

#### 3. Configure the build:
```bash
eas build:configure
```

#### 4. Build for Android:
```bash
# Build APK for internal testing
eas build --platform android --profile preview

# Build AAB for Google Play Store
eas build --platform android --profile production
```

 
### Alternative: Expo Classic Build (Deprecated but still functional)
```bash
# Build APK
expo build:android -t apk

 


```

## 🔧 Configuration

### Expo Configuration (app.json)
Key configurations in your `app.json`:
- App name and version
- Platform-specific settings
- Icons and splash screens
- Permissions required

### Adding New Features
1. Create new screens in the `app/` directory
2. Add reusable components in `components/`
3. Update navigation if needed
4. Add any new dependencies with `npx expo install <package>`

## 🔧 Common Issues & Troubleshooting

### Expo Development Issues
```bash
# Clear Expo cache
npx expo start -c
# or
npx expo start --clear

# Reset project (if you haven't started development yet)
npm run reset-project
```

### Package Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Device Connection Issues
- Make sure your device and computer are on the same Wi-Fi network
- Try restarting the Expo development server
- Check if Expo Go app is updated to the latest version
- For Android: Enable Developer Options and USB Debugging

### Build Issues
- Ensure all dependencies are compatible with Expo
- Check that you're using supported Node.js version
- Verify your Expo CLI is up to date: `npm install -g @expo/cli@latest`

## 📱 App Store Deployment

### Google Play Store (Android):
1. Build production AAB with EAS: `eas build --platform android --profile production`
2. Download the AAB file from your EAS build
3. Upload to Google Play Console
4. Fill in store listing information
5. Submit for review

 
 
## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Device and OS version
- Expo SDK version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

 
## 👨‍💻 Developer

- **Sandumi Dilthara** - *Lead Developer* - [@sandumidilthara](https://github.com/sandumidilthara)

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: [sandumidilthara729@gmail.com]

 
## 🙏 Acknowledgments

- Thanks to Expo team for the amazing development platform
- React Native community for excellent libraries
- Contributors who helped improve this app

## youtube vedio Link : https://youtube.com/shorts/ZPqjzgpfA44?si=Cdas2mFggXnl15WA
## APK Link : https://expo.dev/artifacts/eas/7ScqwWGpVuwaxunjGCN5Mi.apk

**Happy budgeting! 💰📱**
