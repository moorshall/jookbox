import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { Box, createTheme, ThemeOptions } from "@mui/material";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
    return (
        <>
            <Router>
                <div className="min-h-screen w-screen md:p-14 p-10">
                    <Navbar />
                    <div>
                        <div className="my-10">
                            <AllRoutes />
                        </div>
                        <Footer />
                    </div>
                </div>
            </Router>
        </>
    );
}

function AllRoutes() {
    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="feed" element={<FeedPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="login" element={<LoginPage />} />
            </Routes>
        </>
    );
}