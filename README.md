# Early Islamic Qiblas

A web application for visualizing early Islamic qibla (prayer direction) data with interactive maps and tabular views.

## Prerequisites

- **Node.js and npm/Yarn** - For running the React frontend
- **.NET 9.0 SDK** - For running the ASP.NET Core backend
- **Mapbox Account** - For map visualization

## Getting Started

1. **Mapbox Setup**
   - Get a Mapbox access token from [https://account.mapbox.com/](https://account.mapbox.com/)
   - Create a `.env` file in the `ClientApp` folder:
   ```shell
   REACT_APP_MAPBOX_ACCESS_TOKEN = <your_key>
   REACT_APP_MAPBOX_STYLE = <your_style>
   ```

2. **Installation**
   ```bash
   # Install backend dependencies
   dotnet restore
   
   # Install frontend dependencies
   cd ClientApp
   npm install
   ```

3. **Running the Application**
   ```bash
   # From the root directory
   dotnet run
   ```

## Technology Stack

### Backend - ASP.NET Core (.NET 9.0)
- **Framework**: ASP.NET Core MVC with SPA Services
- **Database**: Entity Framework Core with In-Memory provider
- **Data**: JSON files in `/Data` folder
- **Controllers**: MosqueController (tabular data), MarkerController (geo markers)
- **Architecture**: Repository pattern with dependency injection

### Frontend - React
- **React**: ^16.8.6
- **Mapping**: Mapbox GL JS ^2.6.1
- **UI Components**: Bootstrap 4, Reactstrap
- **Data Tables**: React Table ^6.10.0
- **Routing**: React Router DOM ^4.3.1

## Project Structure

```
├── ClientApp/              # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── assets/         # CSS and static assets
│   │   └── helpers/        # Utility functions
├── Controllers/            # ASP.NET Core controllers
├── Models/                 # Domain models and services
├── Data/                   # JSON data files
└── Properties/             # Launch settings
```

## Features

- Interactive map visualization of mosque locations
- Tabular data view with pagination
- Responsive design
- CORS-enabled API
- In-memory data persistence 

![Qiblas](qiblas2.png)
![Qiblas](qiblas.PNG)