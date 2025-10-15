# 🏛️ Auction Registration System

A modern, full-featured auction registration system built with Next.js 15, TypeScript, and Firebase. Features comprehensive Arabic (RTL) support, digital signatures, PDF generation, and real-time data synchronization.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### Core Functionality
- 📝 **Registration Management** - Complete auction registration workflow
- 🔐 **Firebase Authentication** - Secure user authentication with anonymous and email/password support
- 📄 **PDF Generation** - Professional PDF receipts with Arabic support
- ✍️ **Digital Signatures** - Canvas-based signature capture for both bidders and employees
- 🖼️ **Image Handling** - Upload, compress, and manage bidder photos
- 💾 **Real-time Database** - Firestore integration with offline support

### Technical Highlights
- 🌍 **RTL Support** - Full Right-to-Left layout for Arabic language
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- ⚡ **Turbopack** - Lightning-fast build and development experience
- 🎨 **Modern UI** - Clean, professional interface with Arabic fonts (Tajawal)
- 🧪 **Testing** - Jest and React Testing Library integration
- 🔍 **Code Quality** - ESLint and Prettier for consistent code style
- 📦 **Type Safety** - Full TypeScript support

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Firebase account and project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrwolf1595/auction-registration.git
   cd auction-registration
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Configure Firebase** (See [Firebase Setup](#-firebase-setup) section below)

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on "Web" icon to add a web app

### 2. Enable Services

#### Authentication
- Go to **Authentication** → **Sign-in method**
- Enable **Email/Password**
- Enable **Anonymous** authentication (for public registration)

#### Firestore Database
- Go to **Firestore Database** → **Create database**
- Start in **production mode** (we'll add rules later)
- Choose your region

#### Storage
- Go to **Storage** → **Get started**
- Start in **production mode**
- Configure storage rules as needed

### 3. Security Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registrations/{registrationId} {
      allow read, write: if request.auth != null;
    }
    match /auctions/{auctionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 📁 Project Structure

```
auction-registration/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── register/             # Registration pages
│   │   ├── employee/             # Employee dashboard
│   │   ├── test-pdf/             # PDF testing utilities
│   │   ├── globals.css           # Global styles with RTL
│   │   ├── layout.tsx            # Root layout (RTL configured)
│   │   └── page.tsx              # Home page
│   ├── components/               # Reusable React components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility functions and configs
│   │   └── firebase.ts           # Firebase configuration
│   ├── types/                    # TypeScript type definitions
│   └── public/                   # Static assets
├── New folder/                   # Documentation and guides
│   ├── README.md                 # Detailed documentation
│   ├── FIREBASE_SETUP.md         # Firebase setup guide
│   ├── SESSION_MANAGEMENT_EN.md  # Session management docs
│   └── ...                       # Additional documentation
├── .env.local                    # Environment variables (not in git)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.mjs             # ESLint configuration
├── jest.config.js                # Jest testing configuration
└── package.json                  # Dependencies and scripts
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build production-ready application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Automatically fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting without changes |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run Jest tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

## 📦 Key Technologies

### Frontend
- **[Next.js 15.5.4](https://nextjs.org/)** - React framework with App Router
- **[React 19.1.0](https://reactjs.org/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[tailwindcss-rtl](https://github.com/20lives/tailwindcss-rtl)** - RTL support for Tailwind

### Backend & Services
- **[Firebase 12.4.0](https://firebase.google.com/)** - Backend-as-a-Service
  - Authentication
  - Firestore Database
  - Cloud Storage

### Forms & Validation
- **[React Hook Form 7.65.0](https://react-hook-form.com/)** - Form state management
- **[Yup 1.7.1](https://github.com/jquense/yup)** - Schema validation
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Validation resolver

### PDF & Signatures
- **[jsPDF 3.0.3](https://github.com/parallax/jsPDF)** - PDF generation
- **[pdfmake 0.2.20](https://pdfmake.github.io/)** - Advanced PDF creation
- **[html2canvas 1.4.1](https://html2canvas.hertzen.com/)** - HTML to canvas rendering
- **[react-signature-canvas](https://github.com/agilgur5/react-signature-canvas)** - Signature capture

### Development Tools
- **[ESLint 9](https://eslint.org/)** - Code linting
- **[Prettier 3.6.2](https://prettier.io/)** - Code formatting
- **[Jest 30.2.0](https://jestjs.io/)** - Testing framework
- **[React Testing Library](https://testing-library.com/react)** - Component testing

## 🌐 RTL (Right-to-Left) Support

This application is fully optimized for Arabic language with comprehensive RTL support:

### Features
- ✅ HTML direction set to `dir="rtl"` and `lang="ar"`
- ✅ Arabic font family: **Tajawal** from Google Fonts
- ✅ RTL-aware layout and components
- ✅ Bidirectional text support
- ✅ RTL-specific utility classes

### Usage Example
```tsx
// Components automatically inherit RTL direction
<div className="text-right">
  نص عربي
</div>

// Custom RTL classes available
<div className="rtl:text-right ltr:text-left">
  Bidirectional text
</div>
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mrwolf1595/auction-registration)

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 📚 Documentation

Comprehensive documentation is available in the `New folder/` directory:

- **[Complete Documentation](New%20folder/README.md)** - Full system documentation
- **[Firebase Setup Guide](New%20folder/FIREBASE_SETUP.md)** - Detailed Firebase configuration
- **[Session Management](New%20folder/SESSION_MANAGEMENT_EN.md)** - User session handling
- **[PDF System Documentation](New%20folder/PDF_SYSTEM_DOCUMENTATION.md)** - PDF generation guide
- **[Quick Start (Arabic)](New%20folder/QUICK_START_AR.md)** - Arabic quick start guide

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing code style
- Run `npm run lint:fix` before committing
- Run `npm run format` to format code
- Ensure all tests pass with `npm test`
- Add tests for new features

## 🐛 Known Issues & Troubleshooting

### Firebase Authentication Issues
- Ensure anonymous authentication is enabled in Firebase Console
- Check that your environment variables are correctly set

### PDF Generation Problems
- Verify that all required fonts are loaded
- Check browser console for canvas errors

### Build Errors
- Clear `.next` folder: `rm -rf .next` (or `Remove-Item -Recurse -Force .next` on Windows)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

For more issues, check the [Issues](https://github.com/mrwolf1595/auction-registration/issues) page.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **mrwolf1595** - *Initial work* - [@mrwolf1595](https://github.com/mrwolf1595)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend services
- Tailwind CSS for the utility-first approach
- All open-source contributors

## 📞 Support

If you need help or have questions:

- 📧 Create an [Issue](https://github.com/mrwolf1595/auction-registration/issues)
- 💬 Start a [Discussion](https://github.com/mrwolf1595/auction-registration/discussions)
- 📖 Check the [Documentation](New%20folder/README.md)

---

<div align="center">

**Made with ❤️ for the auction community**

[Report Bug](https://github.com/mrwolf1595/auction-registration/issues) · [Request Feature](https://github.com/mrwolf1595/auction-registration/issues) · [Documentation](New%20folder/README.md)

</div>
