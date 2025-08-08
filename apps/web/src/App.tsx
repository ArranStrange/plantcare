import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { plantCareTheme } from "./theme/plantCareTheme";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import AddPlant from "./pages/AddPlant";
import Rooms from "./pages/Rooms";
import PlantDetail from "./pages/PlantDetail";
import { ApiProvider } from "./contexts/ApiContext";

function App() {
  return (
    <ThemeProvider theme={plantCareTheme}>
      <CssBaseline />
      <ApiProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/add-plant" element={<AddPlant />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/plant/:id" element={<PlantDetail />} />
            </Routes>
          </Layout>
        </Router>
      </ApiProvider>
    </ThemeProvider>
  );
}

export default App;
