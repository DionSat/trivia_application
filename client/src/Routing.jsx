import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Leaderboard from "./components/Leaderboard";

export default function Routing() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/leaderboard' element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}