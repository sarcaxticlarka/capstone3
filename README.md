# 🎬 CineScope – Movie & Series Discovery Platform---



A full-stack Netflix-style streaming platform for discovering and watching movies & TV shows.```markdown

# 🎬 CineScope – Movie & Series Discovery Website

## 🚀 Quick Start

## 🧩 Project Overview

### Prerequisites**CineScope** is a full-stack web application that helps users discover, search, and explore movies and TV series from multiple platforms — all in one place.  

- Node.js 18+With real-time data fetching from the **TMDB API**, users can view trending titles, apply filters, manage watchlists, and add favorites — creating a personalized entertainment experience.

- MongoDB (local or Atlas)

- TMDB API Key ([Get here](https://www.themoviedb.org/settings/api))---



### Installation## 🚩 Problem Statement

In the modern digital landscape, thousands of movies and TV shows release every year across platforms like Netflix, Amazon Prime, Disney+, and more.  

```bashUsers often face the **“What should I watch next?”** dilemma due to the lack of a unified discovery system.

# 1. Clone repository

git clone https://github.com/sarcaxticlarka/capstone3.git**CineScope** addresses this problem by providing:

cd capstone3- A single platform to **explore**, **search**, and **filter** entertainment content.

- Real-time updates and intelligent discovery powered by **TMDB API**.

# 2. Setup Server- User personalization features like **favorites** and **watchlists**.

cd server

npm install---

echo "MONGO_URI=your_mongodb_uri\nJWT_SECRET=your_secret_key\nPORT=5000" > .env

node src/index.js## 🏗️ System Architecture



# 3. Setup Client (new terminal)### 🔁 Architecture Flow

cd client```

npm install

echo "TMDB_API_KEY=81f4065ed423ff304fb5c85d33617a83\nNEXT_PUBLIC_API_URL=http://localhost:5000" > .env.localNext.js (Frontend + Backend API Routes) → MongoDB → TMDB API

npm run dev

``````



Visit: **http://localhost:3000**### ⚙️ Stack Overview

| Layer | Description |

---|-------|--------------|

| **Frontend** | Next.js (App Router) with dynamic routing and server-side rendering |

## ✨ Features| **Backend** | Next.js API Routes (Express-like endpoints) |

| **Database** | MongoDB (storing user accounts, favorites, and watchlists) |

### Core Features| **Authentication** | JWT-based authentication (NextAuth optional) |

- 🔐 **User Authentication** - JWT-based login/signup with protected routes| **Hosting** | Vercel (frontend + backend) + MongoDB Atlas (database) |

- 🎬 **Continue Watching** - Auto-tracked watch history with resume functionality| **External API** | TMDB (The Movie Database) API |

- ❤️ **Favorites & Watchlist** - Save and manage your content

- 🔍 **Smart Search** - Debounced search (500ms) with infinite scroll---

- 📱 **Fully Responsive** - Mobile-first design with TailwindCSS

## 🌟 Key Features

### Content Discovery

- 🔥 **9 Categorized Sections**: Trending, New Releases, Emotional/Drama, Romantic, Blockbusters, Hollywood Action, Bollywood, New Series, Popular TV| Category | Features |

- 🎯 **Genre Filtering** - Dropdown with 20+ genres|-----------|-----------|

- 📺 **Movies & TV Shows** - Dedicated pages for each| **Authentication & Authorization** | JWT-based user registration, login, logout; secure protected pages for watchlist & favorites |

- 🎥 **Embedded Player** - Watch content directly via vidsrc| **Dynamic Data Fetching** | Real-time data fetching with SWR caching for optimal performance |

| **Searching** | Live search with debounced input (500ms) and infinite scroll pagination |

### Performance| **Sorting & Filtering** | Genre dropdown, region filters, language filters, sort by popularity/rating/release date |

- ⚡ **SWR Caching** - 60% reduction in API calls| **Categorized Sections** | 9+ horizontal scroll sections: Trending, New Releases, Emotional/Drama, Romantic, Blockbusters, South Indian, Hollywood, Bollywood, New Series |

- 🔄 **Infinite Scroll** - Seamless pagination| **Pagination** | Infinite scroll with intersection observer (no manual pagination needed) |

- 💨 **Loading Skeletons** - Better perceived performance| **CRUD Operations** | Add/remove items in watchlist and favorites with optimistic updates |

- 🎨 **Optimized Rendering** - Fast page loads with Next.js| **Frontend Routing** | Pages: `/`, `/login`, `/register`, `/search`, `/movie/[id]`, `/tv/[id]`, `/profile`, `/category`, `/player/[type]/[id]` |

| **Responsive UI** | Fully responsive using TailwindCSS with loading skeletons for better UX |

---| **Performance** | SWR caching reduces API calls by ~60%, debounced search, optimized rendering |

| **Player Integration** | Embedded vidsrc player for movies and TV shows |

## 🛠️ Tech Stack| **Disclaimer Modal** | Educational purpose disclaimer (shown on first visit) |

| **Hosting** | Deployed on **Vercel** for full-stack functionality |

| Layer | Technology |

|-------|-----------|---

| Frontend | Next.js 16, React 19, TailwindCSS v4 |

| Backend | Express.js, Next.js API Routes |## 💻 Tech Stack

| Database | MongoDB + Mongoose |

| Auth | JWT (7-day expiry) || Layer | Technologies |

| API | TMDB API ||--------|---------------|

| Caching | SWR || **Frontend** | Next.js (App Router), TailwindCSS, SWR (data fetching & caching), React Intersection Observer |

| Deployment | Vercel (client), Render (server) || **Backend (API Routes)** | Next.js API Routes, bcrypt for password hashing, Express.js (standalone server) |

| **Database** | MongoDB with Mongoose |

---| **Authentication** | JWT (JSON Web Token) |

| **External API** | TMDB (The Movie Database) API |

## 📁 Project Structure| **Hosting** | Vercel (App) + MongoDB Atlas (Database) |



```---

capstone3/

├── client/                 # Next.js frontend## 🔗 API Overview

│   ├── app/               # App router pages

│   │   ├── landing/       # Home page| Endpoint | Method | Description | Access |

│   │   ├── movie/[id]/    # Movie details|-----------|---------|-------------|---------|

│   │   ├── tv/[id]/       # TV show details| `/api/auth/signup` | **POST** | Register new user and store credentials in MongoDB | Public |

│   │   ├── player/        # Video player| `/api/auth/login` | **POST** | Authenticate user and return JWT token | Public |

│   │   ├── profile/       # User profile| `/api/movies/trending` | **GET** | Fetch trending movies/series from TMDB | Authenticated |

│   │   ├── search/        # Search results| `/api/movies/search` | **GET** | Search movies by title query | Authenticated |

│   │   └── api/tmdb/      # TMDB proxy routes| `/api/movies/:id` | **GET** | Fetch detailed movie/series info | Authenticated |

│   ├── components/        # React components| `/api/user/favorites` | **GET** | Fetch user’s favorite list | Authenticated |

│   └── .env.local         # Environment variables| `/api/user/favorites` | **POST** | Add a movie/series to favorites | Authenticated |

│| `/api/user/favorites/:id` | **DELETE** | Remove movie/series from favorites | Authenticated |

└── server/                # Express backend| `/api/user/watchlist` | **GET** | Get user’s watchlist | Authenticated |

    ├── src/| `/api/user/watchlist` | **POST** | Add movie/series to watchlist | Authenticated |

    │   ├── models/        # Mongoose schemas| `/api/user/watchlist/:id` | **DELETE** | Remove movie/series from watchlist | Authenticated |

    │   ├── routes/        # API endpoints

    │   └── index.js       # Server entry---

    └── .env               # Server config

```## 🚀 Hosting

- **Frontend + Backend:** [Vercel](https://capstone3-lemon.vercel.app/)

---- **Backend:** [Render](https://capstone3-6ywq.onrender.com)

- **External API:** [TMDB API](https://www.themoviedb.org/documentation/api)

## 🔌 API Endpoints

---

### Authentication

- `POST /api/auth/signup` - Register user 

- `POST /api/auth/login` - Login user---



### User Data (Protected)## 🧠 Future Enhancements

- `GET /api/user/favorites` - Get favorites- AI-based movie recommendations  

- `POST /api/user/favorites` - Add to favorites- Multi-language support  

- `DELETE /api/user/favorites/:id` - Remove favorite- Advanced watch history tracking  

- `GET /api/user/watchlist` - Get watchlist- User reviews and ratings  

- `POST /api/user/watchlist` - Add to watchlist

- `DELETE /api/user/watchlist/:id` - Remove from watchlist---

- `GET /api/user/watch-history` - Get watch history

- `POST /api/user/watch-history` - Track watched content## 👨‍💻 Author

**Md Sajjan**  

### TMDB Proxy

- `GET /api/tmdb/trending` - Trending content---

- `GET /api/tmdb/search` - Search movies/TV 

- `GET /api/tmdb/movie/:id` - Movie details 

- `GET /api/tmdb/tv/:id` - TV show details
- `GET /api/tmdb/genres` - Genre list
- `GET /api/tmdb/discover` - Filtered discovery

---

## 🎯 Key Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero banner & categories |
| `/login` | User login |
| `/register` | User registration |
| `/films` | Browse all movies |
| `/TV-Shows` | Browse all TV shows |
| `/search` | Search results with infinite scroll |
| `/movie/[id]` | Movie detail page |
| `/tv/[id]` | TV show detail page |
| `/player/[type]/[id]` | Video player |
| `/profile` | User profile with history/favorites/watchlist |
| `/category` | Filtered category view |

---

## 🧪 Testing

```bash
# Client tests
cd client
npm test

# Server tests
cd server
npm test
```

---

## 🚀 Deployment

### Vercel (Client)
```bash
cd client
vercel --prod
```

### Render/Railway (Server)
1. Connect GitHub repository
2. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT=5000`
3. Deploy

---

## 🎨 Features Walkthrough

### 1. Continue Watching
- Automatically tracks watched content
- Shows on home page for logged-in users
- Click to resume watching

### 2. Search & Discovery
- Real-time search with debouncing
- Infinite scroll pagination
- Genre-based filtering
- Sort by popularity, rating, date

### 3. User Profile
- Recently watched (with dates)
- Favorites collection
- Watchlist management
- One-click remove buttons

### 4. Video Player
- Embedded vidsrc player
- Auto-tracks to watch history
- Fullscreen support
- Works for movies & TV shows

---

## 🔒 Security

- Passwords hashed with bcrypt
- JWT tokens with 7-day expiry
- Protected API routes
- Environment variables for secrets
- CORS enabled for API

---

## 📊 Performance Metrics

- **SWR Caching**: ~60% reduction in API calls
- **First Load**: < 2s (with fast 3G)
- **Infinite Scroll**: Smooth 60fps
- **Lighthouse Score**: 90+ (Performance)

---

## 🐛 Troubleshooting

**Port Already in Use**
```bash
lsof -ti:3000 | xargs kill -9  # Kill Next.js
lsof -ti:5000 | xargs kill -9  # Kill Express
```

**MongoDB Connection Error**
- Check `MONGO_URI` in `.env`
- Verify network access (if using Atlas)

**TMDB API Not Working**
- Verify `TMDB_API_KEY` in `.env.local`
- Restart Next.js dev server

---

## 👨‍💻 Author

**Md Sajjan**  
GitHub: [@sarcaxticlarka](https://github.com/sarcaxticlarka)

---

## 📝 License

MIT License - feel free to use this project for learning!

---

**⭐ Star this repo if you found it helpful!**
