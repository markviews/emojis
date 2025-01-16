"use client";
import React, { useState } from "react";
import EmojiGrid from "./grid";
import LoginPage from "./LoginPage";
import FirebaseHandler from './firebase';
import SettingsPage from "./settings";
import Notification from "./notification";

export default function Home() {
  const [activeTab, setActiveTab] = useState('emojis');

  return (
    <div>
      <Notification />
      <FirebaseHandler activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "login" && <LoginPage />}

      {activeTab !== "login" && (
        <>
          <div className="page-wrapper">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex flex-grow">
              <div className="content">
                {activeTab === "emojis" && <EmojiGrid setActiveTab={setActiveTab} />}
                {activeTab === "settings" && <SettingsPage setActiveTab={setActiveTab} />}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Header({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  return (
    <header className="header">
      <div className="tabs">
        <div
          className={`tab ${activeTab === "emojis" ? "active" : ""}`}
          onClick={() => setActiveTab("emojis")}
        >
          Emojis
        </div>
        <div
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </div>
      </div>
      <h1 className="title">Emoji Manager</h1>
    </header>
  );
}
