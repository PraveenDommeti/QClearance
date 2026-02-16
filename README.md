# 🛫 Sky Guardian - QClearance

> **AI-Powered Runway Slot Decision Integrity System**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)

**Sky Guardian - QClearance** is a cutting-edge decision integrity system for airport runway and taxiway operations. It leverages **multi-agent AI reasoning** and **quantum-inspired optimization** to ensure safe, efficient, and fair runway slot allocation in real-time.

🎥 Watch Demo Video : https://youtu.be/edWuDklZWTY
Live Demo : https://qclearance.netlify.app/

---

## 🌟 Key Features

### 🤖 **Multi-Agent AI Analysis**
- **Specialized AI Agents** analyze critical factors:
  - ⛽ **Fuel Agent**: Monitors fuel reserves vs. flight time
  - ☁️ **Weather Agent**: Validates visibility and wind conditions
  - 🚧 **Congestion Agent**: Tracks taxiway traffic density
  - 🛡️ **Safety Agent**: Ensures separation standards
  - ⚖️ **Fairness Agent**: Prevents slot starvation

### ⚛️ **Quantum-Inspired Optimization**
- **Simulated Annealing Algorithm** evaluates thousands of permutations
- Optimizes for minimal wait time, fuel consumption, and maximum throughput
- Provides risk reduction metrics and explainable recommendations

### 📊 **Real-Time Visualization**
- **Live Runway Queue** with flight status monitoring
- **Interactive Map View** with animated flight paths
- **Taxiway Management** with realistic L-shaped path following
- **Emergency Prioritization** with visual alerts

### 🔒 **Safety & Compliance**
- **Single-Runway Logic**: Prevents simultaneous runway usage
- **Conflict Detection**: Real-time audio and visual alerts
- **Audit Trail**: Complete history of all decisions and analyses
- **Human-in-the-Loop**: Final approval required for all actions

### 🎯 **Automated Pipeline**
- **Continuous Monitoring** of runway operations
- **Auto-Analysis** triggered by queue changes
- **Smart Notifications** for critical situations
- **Seamless Workflow** from detection to decision

---

## 🏗️ System Architecture

### Workflow Phases

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 1: Live Monitoring (Continuous)                      │
│  📡 Real-time flight tracking & queue management             │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 2: Slot Requests & Prioritization (Continuous)       │
│  ⏱️ Intelligent queue ordering based on fuel, schedule, etc. │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 3: Agent-Based Analysis (On Selection)               │
│  🤖 Multi-agent AI risk assessment & reasoning               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 4: Quantum Optimization (Auto-Triggered)             │
│  ⚛️ Simulated annealing for optimal slot ordering            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 5: Decision Review (Human-in-the-Loop)               │
│  🚦 Controller approval/rejection with full transparency     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 6: Audit & Monitoring (Background)                   │
│  📝 Immutable logs & performance dashboards                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.8** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Premium UI components
- **React Router** - Client-side routing

### AI & Optimization
- **Google Gemini API** - Multi-agent reasoning
- **Custom Simulated Annealing** - Quantum-inspired optimization
- **Real-time Analysis** - Sub-second decision processing

### State Management
- **React Context** - Global state (FlightData, Auth, Analysis)
- **TanStack Query** - Server state management
- **Custom Hooks** - Continuous monitoring & automation

### Visualization
- **Lucide React** - Icon system
- **Recharts** - Data visualization
- **Custom Animations** - Flight path rendering

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **bun** package manager
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sky-guardian.git
   cd sky-guardian
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_AI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:8080`

### Default Login Credentials
- **Username**: `controller`
- **Password**: `demo123`

---

## 📖 Usage Guide

### Basic Workflow

1. **Login** to the dashboard
2. **Monitor** the live runway queue in the "Live Queue" tab
3. **Review** incoming slot requests in the "Slot Requests" tab
4. **Select** flights for analysis
5. **Start Analysis** to trigger AI agent evaluation
6. **Review** quantum optimization results
7. **Approve/Reject** the recommended decision
8. **Monitor** execution on the map view
9. **Audit** past decisions in the "Audit History" tab

### Advanced Features

#### Automated Pipeline
Enable continuous monitoring for hands-free operation:
- System automatically analyzes queue changes
- Provides recommendations for approval
- Alerts on critical situations (fuel, weather, conflicts)

#### Emergency Handling
- Emergency landings automatically prioritized
- Visual and audio alerts for urgent situations
- Override capabilities for human controllers

#### Map Visualization
- Real-time flight animations
- Taxiway path following (L-shaped routes)
- Runway status indicators
- Gate assignments

---

## 📁 Project Structure

```
sky-guardian/
├── src/
│   ├── components/          # React components
│   │   ├── tabs/           # Dashboard tab components
│   │   ├── DemoControls.tsx
│   │   ├── Header.tsx
│   │   ├── MapView.tsx
│   │   └── Sidebar.tsx
│   ├── contexts/           # React Context providers
│   │   ├── AnalysisContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── FlightDataContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useContinuousMonitoring.ts
│   │   └── useFlightAnimations.ts
│   ├── lib/                # Core logic
│   │   ├── quantum.ts      # Simulated annealing
│   │   ├── slotWindow.ts   # Slot management
│   │   └── soundEffects.ts # Audio alerts
│   ├── data/               # Mock data & types
│   │   └── mockData.ts
│   ├── pages/              # Route pages
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── IncidentReplay.tsx
│   └── App.tsx             # Root component
├── public/                 # Static assets
│   ├── _redirects         # Netlify SPA routing
│   └── robots.txt
├── netlify.toml           # Netlify configuration
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deployment

### Deploy to Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder**
   - Drag and drop to [Netlify](https://app.netlify.com/)
   - Or use Netlify CLI:
     ```bash
     npm install -g netlify-cli
     netlify deploy --prod --dir=dist
     ```

3. **Configure environment variables** in Netlify dashboard:
   - `VITE_AI_API_KEY` = Your Gemini API key

4. **Verify deployment**
   - Test all routes (no 404 errors)
   - Check AI analysis functionality
   - Verify map animations

📚 **Full deployment guide**: [NETLIFY_DEPLOYMENT_GUIDE.md](./NETLIFY_DEPLOYMENT_GUIDE.md)

---

## 📊 System Capabilities

### Performance Metrics
- ⚡ **Analysis Speed**: < 5 seconds per flight
- 🔄 **Permutation Evaluation**: 1000+ scenarios in < 3 seconds
- 📈 **Queue Processing**: Up to 20 concurrent flights
- 🎯 **Decision Accuracy**: AI-powered risk assessment

### Safety Features
- ✅ Single-runway conflict prevention
- ✅ Emergency landing prioritization
- ✅ Fuel-critical flight detection
- ✅ Weather-based decision adjustment
- ✅ Taxiway congestion management
- ✅ Complete audit trail

### Use Cases
- 🏢 **Airport Traffic Control Centers**
- 🚨 **Emergency Response Coordination**
- 📊 **Runway Capacity Optimization**
- 🎓 **Aviation Training & Simulation**
- 🔬 **Research & Development**

---

## 🎓 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[System Flow](./SYSTEM_FLOW.md)** - Detailed workflow documentation
- **[Deployment Guide](./NETLIFY_DEPLOYMENT_GUIDE.md)** - Production deployment
- **[YouTube Upload Guide](./YOUTUBE_UPLOAD_GUIDE.md)** - Video marketing resources
- **[Testing Guide](./TESTING_GUIDE.md)** - Testing strategies
- **[Advanced Features](./ADVANCED_FEATURES.md)** - Deep dive into capabilities

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**Sky Guardian - QClearance** is a **prototype/demonstration system** designed for validation, research, and educational purposes. 

**This system is NOT certified for operational use in live air traffic control environments.**

For production deployment in safety-critical aviation systems, additional certification, testing, and regulatory approval would be required.

---

## 🙏 Acknowledgments

- **Google Gemini API** - AI reasoning capabilities
- **shadcn/ui** - Beautiful UI components
- **Lucide Icons** - Icon system
- **Tailwind CSS** - Styling framework
- **React Community** - Excellent ecosystem

---

## 📧 Contact

**Project Maintainer**: [Your Name]

- 🌐 **Website**: [your-website.com](#)
- 📧 **Email**: [your-email@example.com](#)
- 💼 **LinkedIn**: [Your LinkedIn](#)
- 🐙 **GitHub**: [@yourusername](#)

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

---

## 📈 Roadmap

### Current Version (v1.0)
- ✅ Multi-agent AI analysis
- ✅ Quantum-inspired optimization
- ✅ Real-time visualization
- ✅ Automated pipeline
- ✅ Audit trail

### Planned Features (v2.0)
- 🔄 Multi-runway support
- 🌍 Weather API integration
- 📱 Mobile responsive design
- 🔔 Advanced notification system
- 📊 Enhanced analytics dashboard
- 🔐 Role-based access control
- 🌐 Multi-airport support

---

<div align="center">

**Built with ❤️ for Aviation Safety**

[⬆ Back to Top](#-sky-guardian---qclearance)

</div>
