import React, { useState, useEffect } from "react";
import Admin from "./pages/Admin/Admin.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";

function App() {
  const [view, setView] = useState("privacy");
  useEffect(() => {window.scrollTo(0, 0);}, [view]);

  if (view === "contact") {
    return <Contact onNavigate={setView} />;
  }

  if (view === "faq") {
    return <FAQ onNavigate={setView} />;
  }

  if (view === 'privacy') {
    return <PrivacyPolicy onNavigate={setView} />;
  }

  return <Admin />;
}

export default App;
