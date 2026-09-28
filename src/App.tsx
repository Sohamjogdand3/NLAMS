import { useState } from "react";

import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";

import CitizenDashboard from "./components/dashboards/CitizenDashboard";
import SurveyorDashboard from "./components/dashboards/SurveyorDashboard";
import TalathiDashboard from "./components/dashboards/TalathiDashboard";
import TehsildarDashboard from "./components/dashboards/TehsildarDashboard";
import LAODashboard from "./components/dashboards/LAODashboard";
import CollectorDashboard from "./components/dashboards/CollectorDashboard";
import ProjectAgencyDashboard from "./components/dashboards/ProjectAgencyDashboard";
import StateAdminDashboard from "./components/dashboards/StateAdminDashboard";
import CentralAdminDashboard from "./components/dashboards/CentralAdminDashboard";

import "./App.css";

type PageState = "landing" | "login" | "dashboard";

function App() {

  const [currentPage, setCurrentPage] =
    useState<PageState>("landing");

  const [activeRole, setActiveRole] =
    useState<string>("citizen");


  const handleNavigateToLogin = () => {
    setCurrentPage("login");
  };


  const handleLoginSuccess = (roleId: string) => {

    setActiveRole(roleId);

    setCurrentPage("dashboard");

  };


  const handleLogout = () => {

    setActiveRole("citizen");

    setCurrentPage("landing");

  };


  return (

    <div className="app-container">

      {/* LANDING */}

      {currentPage === "landing" && (

        <LandingPage
          onNavigateToLogin={handleNavigateToLogin}
        />

      )}


      {/* LOGIN */}

      {currentPage === "login" && (

        <LoginPage
          onLoginSuccess={handleLoginSuccess}

          onBackToLanding={() =>
            setCurrentPage("landing")
          }

        />

      )}


      {/* DASHBOARDS */}

      {currentPage === "dashboard" && (

        <>

          {/* 1. CITIZEN */}

          {activeRole === "citizen" && (

            <CitizenDashboard
              onLogout={handleLogout}
            />

          )}


          {/* 2. SURVEYOR */}

          {activeRole === "surveyor" && (

            <SurveyorDashboard
              onLogout={handleLogout}
            />

          )}


          {/* 3. TALATHI */}

          {activeRole === "talathi" && (

            <TalathiDashboard
              onLogout={handleLogout}
            />

          )}


          {/* 4. TEHSILDAR */}

          {activeRole === "tehsildar" && (

            <TehsildarDashboard
              onLogout={handleLogout}
            />

          )}


          {/* 5. LAO */}

          {activeRole === "lao" && (

            <LAODashboard
              onLogout={handleLogout}
            />

          )}


          {/* 6. COLLECTOR */}

          {activeRole === "collector" && (

            <CollectorDashboard
              onLogout={handleLogout}
            />

          )}


          {/* 7. PROJECT AGENCY */}

          {activeRole === "project_agency" && (

            <ProjectAgencyDashboard
              onLogout={handleLogout}
            />

          )}


          {/* 8. STATE ADMIN */}

          {activeRole === "state_admin" && (

            <StateAdminDashboard
              onLogout={handleLogout}
            />

          )}


          {/* 9. CENTRAL ADMIN */}

          {activeRole === "central_admin" && (

            <CentralAdminDashboard
              onLogout={handleLogout}
            />

          )}

        </>

      )}

    </div>

  );
}

export default App;