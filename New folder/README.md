# Auction Registration System

A comprehensive auction registration system built with Next.js, TypeScript, and Firebase, featuring RTL (Right-to-Left) support for Arabic language.

## 🚀 Features

- **Next.js 15** with TypeScript and App Router
- **Tailwind CSS** with RTL support and Arabic fonts (Tajawal)
- **Firebase Integration** (Authentication, Firestore, Storage)
- **Form Management** with React Hook Form
- **PDF Generation** with PDFMake
- **Digital Signatures** with React Signature Canvas
- **ESLint & Prettier** for code quality
- **RTL Support** for Arabic language

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project setup

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auction-registration
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local
   
   # Edit .env.local with your Firebase configuration
   nano .env.local
   ```

4. **Firebase Configuration**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Get your Firebase config from Project Settings > General > Your apps
   - Add the configuration values to your `.env.local` file

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Type checking
npm run type-check
```

## 📁 Project Structure

```
auction-registration/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # Global styles with RTL support
│   │   ├── layout.tsx      # Root layout with RTL configuration
│   │   └── page.tsx        # Home page
│   └── lib/
│       └── firebase.ts     # Firebase configuration
├── public/                 # Static assets
├── .env.local.example     # Environment variables template
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore rules
├── eslint.config.mjs      # ESLint configuration
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🎨 RTL Support

The application is configured for Right-to-Left (RTL) layout:

- **HTML Direction**: Set to `dir="rtl"` and `lang="ar"`
- **Arabic Fonts**: Tajawal font family loaded from Google Fonts
- **CSS Classes**: RTL-specific utility classes available
- **Tailwind RTL**: Configured with tailwindcss-rtl plugin

### RTL CSS Classes

```css
.rtl          /* Right-to-left direction */
.ltr          /* Left-to-right direction */
.arabic-text  /* Arabic text styling */
```

## 🔥 Firebase Services

### Authentication
- User registration and login
- Email/password authentication
- User session management

### Firestore Database
- Document-based NoSQL database
- Real-time data synchronization
- Offline support

### Storage
- File upload and download
- Image and document storage
- Secure file access

## 📦 Key Dependencies

- **Next.js 15.5.4** - React framework
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Firebase 12.4.0** - Backend services
- **React Hook Form 7.65.0** - Form management
- **PDFMake 0.2.20** - PDF generation
- **React Signature Canvas 1.1.0** - Digital signatures
- **HTML2Canvas 1.4.1** - Canvas to image conversion

## 🔧 Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production with Turbopack |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript type checking |

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 Environment Variables

Required environment variables in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Happy Coding! 🎉**