# 🌱 PlantCare

A fullstack monorepo application for tracking houseplant care with smart watering reminders, weather-based tips, and a beautiful nature-inspired design.

## ✨ Features

- **🪴 Plant Management**: Add, edit, and organize your plants with photos and care notes
- **💧 Smart Watering**: Visual cards show watering status (overdue, due today, upcoming)
- **🌤️ Weather Integration**: Get smart care tips based on local weather conditions
- **📅 Calendar View**: See all care events in an interactive calendar
- **🏠 Room Organization**: Group plants by room for better organization
- **📱 Mobile-First**: Responsive design optimized for mobile devices
- **🎨 Beautiful UI**: Pastel theme with terracotta and sage green colors
- **🔄 Flip Cards**: Interactive plant cards with care tips on the back

## 🏗️ Architecture

This is a **pnpm monorepo** with the following structure:

```
plantcare/
├── apps/
│   ├── web/        # React + TypeScript + Vite frontend
│   └── server/     # Node.js + Express + Prisma backend
├── packages/
│   ├── types/      # Shared TypeScript types
│   └── config/     # Shared ESLint, Prettier configs
├── package.json    # Root workspace configuration
└── README.md
```

### Tech Stack

**Frontend:**

- React 18 + TypeScript
- Vite for fast development
- Material UI with custom theme
- React Router for navigation
- React Big Calendar for calendar view
- Axios for API calls

**Backend:**

- Node.js + Express
- TypeScript
- Prisma ORM with MongoDB
- RESTful API design
- Weather integration (OpenWeatherMap)

**Shared:**

- TypeScript types package
- ESLint + Prettier configuration
- pnpm workspaces

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- MongoDB database (local or MongoDB Atlas)

### Installation

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd plantcare
   pnpm install
   ```

2. **Set up the database:**

   ```bash
   # Option 1: Use MongoDB Atlas (recommended)
   # Create a free cluster at https://cloud.mongodb.com
   # Get your connection string

   # Option 2: Use local MongoDB
   # Install MongoDB locally and start the service
   mongod
   ```

3. **Configure environment variables:**

   ```bash
   cd apps/server
   cp .env.example .env
   # Edit .env with your MongoDB connection string and OpenWeather API key
   # Example: DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/plantcare?retryWrites=true&w=majority"
   ```

4. **Set up the database schema:**

   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

5. **Start development servers:**

   ```bash
   # Start both frontend and backend
   pnpm dev:all

   # Or start individually:
   pnpm dev:web    # Frontend at http://localhost:3000
   pnpm dev:server # Backend at http://localhost:3001
   ```

## 📱 Usage

### Dashboard

- View all your plants with visual status indicators
- See overdue, due today, and upcoming watering needs
- Click plant cards to flip and see care tips
- Quick "Water Now" button for due plants

### Adding Plants

- Search from curated plant templates
- Or create custom plants with your own details
- Add photos, care notes, and assign to rooms
- Set custom watering frequencies

### Calendar View

- See all care events in month/week/day view
- Mark events as completed
- Visual indicators for overdue and completed tasks

### Room Organization

- Create and manage rooms
- View plants grouped by location
- Edit room names and see plant counts

### Plant Details

- Comprehensive view of individual plants
- Edit plant information
- View care history and upcoming events
- Water tracking with automatic scheduling

## 🎨 Design System

### Color Palette

- **Primary (Sage Green)**: `#A8CBB7` - Main brand color
- **Secondary (Terracotta)**: `#D96C3B` - Accent color
- **Background**: `#F8F6F1` - Warm off-white
- **Text**: `#6D6A75` - Warm grey

### Status Colors

- **Overdue**: `#E85C5C` - Red for urgent attention
- **Due Today**: `#E8B444` - Yellow for today's tasks
- **Watered/Completed**: `#A8CBB7` - Green for success
- **Upcoming**: `#7BB3D9` - Blue for future tasks

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev:all          # Start all apps
pnpm dev:web          # Start frontend only
pnpm dev:server       # Start backend only

# Building
pnpm build            # Build all apps
pnpm build:web        # Build frontend only
pnpm build:server     # Build backend only

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed with dummy data

# Code Quality
pnpm lint             # Lint all packages
pnpm typecheck        # Type check all packages
```

### API Endpoints

**Plants:**

- `GET /api/plants` - Get all plants
- `POST /api/plants` - Create new plant
- `GET /api/plants/:id` - Get plant details
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant
- `POST /api/plants/:id/water` - Mark plant as watered

**Calendar:**

- `GET /api/calendar?start=&end=` - Get calendar events
- `GET /api/calendar/upcoming` - Get upcoming events

**Events:**

- `POST /api/events/:id/complete` - Mark event complete
- `GET /api/events/plant/:id` - Get plant's events

**Weather:**

- `GET /api/weather?lat=&lon=` - Get weather data
- `GET /api/weather/recommendations` - Get care recommendations

**Rooms:**

- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

## 🌐 Deployment

### Environment Variables

**Backend (`apps/server/.env`):**

```bash
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/plantcare?retryWrites=true&w=majority"
OPENWEATHER_API_KEY="your_api_key_here"
PORT=3001
NODE_ENV=production
```

### Production Build

```bash
# Build all apps
pnpm build

# Start production server
cd apps/server
pnpm start
```

### Docker Deployment

```dockerfile
# Example Dockerfile for the full stack
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000 3001
CMD ["pnpm", "dev:all"]
```

## 🧪 Testing

The project includes GitHub Actions CI/CD pipeline that:

- Runs ESLint and TypeScript checks
- Tests database migrations
- Builds all packages
- Seeds test data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔮 Future Enhancements

- **Authentication**: User registration and login
- **PWA Support**: Offline functionality and push notifications
- **Plant Database**: Integration with plant species database
- **Photo Upload**: Camera integration for plant photos
- **Social Features**: Share plants and care tips
- **Advanced Analytics**: Plant health insights and trends
- **IoT Integration**: Smart sensors for automated monitoring

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Plant photos from [Unsplash](https://unsplash.com/)
- Icons from [Material UI](https://mui.com/)
- Weather data from [OpenWeatherMap](https://openweathermap.org/)
- Inspiration from the houseplant community 🌿

---

**Happy plant parenting! 🪴💚**
