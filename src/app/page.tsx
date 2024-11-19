"use client";
import React, { useState } from "react";
import Sidebar from "./sidebar";
import EmojiGrid from "./grid";
import LoginPage from "./LoginPage";
import FirebaseHandler from './firebase';
import SettingsPage from "./settings";
import Notification from "./notification";

export default function Home() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div>
      <Notification/>
      <FirebaseHandler activeTab={activeTab} setActiveTab={setActiveTab}/>

      {activeTab === "login" && <LoginPage/>}

      {activeTab != "login" && 
        <>
        <Header />
        <div className="flex flex-grow"> 
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab}/>

          <div className="content">

            {activeTab === "emojis" && <EmojiGrid/>}
            {activeTab === "settings" && <SettingsPage/>}
            
          </div>
          
        </div>
        </>
      }
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <h1 className="title">Emoji Manager</h1>
    </header>
  );
}

