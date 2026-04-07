// App.jsx
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./Dashboard";
import MembersList from "./Admin/MembersList"; // ✅ New import for librarian member management
import SignupModal from "./User/UserSignup";
import UserLogin from "./User/UserLogin";
import BookUpload from "./Admin/BookUpload";
import BookCatalog from "./User/BookCatalog";
import BorrowHistory from "./User/BorrowHistory";
import LibrarianApprovals from "./Admin/Librarianapprovals";

function App() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("Catalog");

  // ✅ Role state
  const [loginRole, setLoginRole] = useState("Member");

  // ✅ User state
  const [user, setUser] = useState(null);

  // ✅ Loading state for auth check
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ Restore login after refresh
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // ✅ FIX: Ensure IDs are synced (handles old cached users missing 'id')
          if (parsedUser) {
            if (!parsedUser.id && parsedUser._id) parsedUser.id = parsedUser._id;
            if (!parsedUser._id && parsedUser.id) parsedUser._id = parsedUser.id;
          }

parsedUser._id = parsedUser._id || parsedUser.id;
parsedUser.id = parsedUser.id || parsedUser._id;

if (parsedUser?.role && parsedUser?.email) {
              setIsLoggedIn(true);
            setUser(parsedUser);
          } else {
             // If stored user is invalid, clear it
             localStorage.removeItem("user");
             localStorage.removeItem("token");
          }
        }
      } catch (e) {
        console.error("Auth restoration failed:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

const handleLoginSuccess = (info) => {
  const userObj = info.user || info.user?.user;

  const userData = {
    _id: userObj._id || userObj.id,
    id: userObj._id || userObj.id,
    name: userObj.name || `${userObj.firstName} ${userObj.lastName}`,
    email: userObj.email,
    role: userObj.role,
  };

  setUser(userData);
  setIsLoggedIn(true);
  setShowLogin(false);
  setActivePage("Catalog");

  localStorage.setItem("user", JSON.stringify(userData));
  if (info.token) localStorage.setItem("token", info.token);
};

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.warn("Logout request failed (continuing local cleanup):", err);
    } finally {
      // ✅ Always clear local state regardless of network result
      setIsLoggedIn(false);
      setUser(null);
      setActivePage("Catalog");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  // ✅ Role switch handler (for "Login as Librarian" / "Switch to Member")
  const handleRoleSwitch = async (targetRole) => {
    if (!isLoggedIn || !user) return;

    try {
      // Call backend to update session role
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: targetRole }),
      });

      if (res.ok) {
        const updatedUser = { ...user, role: targetRole };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setActivePage("Catalog"); // ✅ Return to dashboard with new role view
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Role switch failed:", errorData.message || res.statusText);
        alert(errorData.message || "Failed to switch role. Please try again.");
      }
    } catch (err) {
      console.error("Role switch error:", err);
      alert("Network error. Please check your connection.");
    }
  };
// Check what's in localStorage
console.log("👤 Stored user object:", user);
console.log("✅ Has id?", !!user?.id);
console.log("✅ Has _id?", !!user?._id);
// In your App.jsx — replace the renderPage function with this:

const renderPage = () => {
  if (authLoading) return null;

  switch (activePage) {
    case "Catalog":
    case "Home":
      // ✅ Pass user as currentUser so BookCatalog/BookModal know who is logged in
      return (
        <Dashboard
          user={user}
          isLoggedIn={isLoggedIn}
          setActivePage={setActivePage}
          currentUser={user}        // ← ADD THIS
        />
      );

    case "Books":
      return (
        <BookCatalog
          currentUser={user}        // ← already correct
          onBack={() => setActivePage("Catalog")}
        />
      );

    case "My Borrows":
  if (!isLoggedIn) {
    return (
      <AccessDenied
        message="Please log in to view your borrows"
        onAction={() => setShowLogin(true)}
        actionLabel="Log In"
      />
    );
  }
  // ✅ Show loading if user ID not ready
  if (!user?.id && !user?._id) {
    return (
      <div style={{ 
        padding: "40px", 
        textAlign: "center", 
        color: "rgba(245,240,232,0.6)",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        Loading your borrowed books...
      </div>
    );
  }
  return (
    <BookCatalog
      currentUser={user}
      filter="borrowed"
      onBack={() => setActivePage("Catalog")}
    />
  );
  

 
    case "History":
      if (!isLoggedIn) {
        return (
          <AccessDenied
            message="Please log in to view your borrow history"
            onAction={() => setShowLogin(true)}
            actionLabel="Log In"
          />
        );
      }
      return (
        <BorrowHistory
          currentUser={user}
          onBack={() => setActivePage("Catalog")}
        />
      );

    // ── CHANGE 1: Add this import at the top of App.jsx ──────────────────────────


// ── CHANGE 2: Replace the "Circulation" case inside renderPage() ──────────────
// Find:   case "Circulation":
// Replace the entire case with this:

    case "Approval":
      if (!isLoggedIn || user?.role !== "Librarian") {
        return (
          <AccessDenied
            message="Librarian access required"
            onAction={() => { setLoginRole("Librarian"); setShowLogin(true); }}
            actionLabel="Log In as Librarian"
          />
        );
      }
      return (
        <LibrarianApprovals
          currentUser={user}
          onBack={() => setActivePage("Catalog")}
        />
      );

    case "Members":
      if (!isLoggedIn || user?.role !== "Librarian") {
        return (
          <AccessDenied
            message="Librarian access required"
            onAction={() => { setLoginRole("Librarian"); setShowLogin(true); }}
            actionLabel="Log In as Librarian"
          />
        );
      }
      return <MembersList onBack={() => setActivePage("Catalog")} currentUser={user} />;

    case "BookUpload":
      if (!isLoggedIn || user?.role !== "Librarian") {
        return (
          <AccessDenied
            message="Librarian access required"
            onAction={() => { setLoginRole("Librarian"); setShowLogin(true); }}
            actionLabel="Log In as Librarian"
          />
        );
      }
      return <BookUpload currentUser={user} onBack={() => setActivePage("Catalog")} />;

   
      if (!isLoggedIn || user?.role !== "Librarian") {
        return (
          <AccessDenied
            message="Librarian access required"
            onAction={() => { setLoginRole("Librarian"); setShowLogin(true); }}
            actionLabel="Log In as Librarian"
          />
        );
      }
      return (
        <PagePlaceholder
          title={activePage}
          icon="⚙️"
          description={`${activePage} management console`}
          onBack={() => setActivePage("Catalog")}
        />
      );

    case "Profile":
      if (!isLoggedIn || !user) {
        return (
          <AccessDenied
            message="Please log in to view your profile"
            onAction={() => setShowLogin(true)}
            actionLabel="Log In"
          />
        );
      }
      return (
        <PagePlaceholder
          title="My Profile"
          icon="👤"
          description={`Manage your account settings, ${user.name}`}
          onBack={() => setActivePage("Catalog")}
        />
      );

    default:
      return (
        <Dashboard
          user={user}
          isLoggedIn={isLoggedIn}
          setActivePage={setActivePage}
          currentUser={user}        // ← ADD THIS
        />
      );
  }
};

  // Show loading spinner while auth is being checked
  if (authLoading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "#1c1510",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(245,240,232,0.6)",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.22-8.55" />
          </svg>
          Initializing...
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ minHeight: "100vh", background: "#1c1510" }}>
      
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isLoggedIn={isLoggedIn}
        user={user}
        
        // ✅ Role-based login trigger
        onLogin={(role = "Member") => {
          setLoginRole(role);
          setShowLogin(true);
        }}

        onSignup={() => setShowSignup(true)}
        onLogout={handleLogout}
        onProfile={() => setActivePage("Profile")}
        
        // ✅ Pass role switch handler for dropdown "Login as Librarian" / "Switch to Member"
        onLoginAsLibrarian={handleRoleSwitch}
      />

      {/* Main Content Area */}
      <main>
        {renderPage()}
      </main>

      {/* Signup Modal */}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      {/* Login Modal */}
      {showLogin && (
        <UserLogin
          role={loginRole}
          onClose={() => setShowLogin(false)}
          onSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

    </div>
  );
}

// ── Helper Components (Keep in same file for simplicity, or extract later) ──

/**
 * Access Denied Page - Shows when user lacks permissions
 */
function AccessDenied({ message, onAction, actionLabel = "Go Back" }) {
  return (
    <div style={{ 
      minHeight: "calc(100vh - 68px)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(180deg, #1c1510 0%, #15100a 100%)",
      padding: "24px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ 
        textAlign: "center", 
        maxWidth: "400px",
        background: "rgba(220,60,40,0.1)",
        border: "1px solid rgba(220,60,40,0.3)",
        borderRadius: "12px",
        padding: "32px 24px",
        color: "rgba(245,240,232,0.8)"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
        <h2 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: "20px", 
          margin: "0 0 12px 0",
          color: "#f5f0e8"
        }}>Access Restricted</h2>
        <p style={{ margin: "0 0 24px 0", fontSize: "14px", opacity: 0.8 }}>{message}</p>
        <button
          onClick={onAction}
          style={{
            padding: "10px 24px",
            background: "linear-gradient(135deg, #b8860b, #d4a017)",
            border: "none",
            borderRadius: "20px",
            color: "#1c1510",
            fontWeight: "600",
            fontSize: "13px",
            cursor: "pointer",
            transition: "filter 0.2s, transform 0.1s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseOut={(e) => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Page Placeholder - Shows while pages are being built
 */
function PagePlaceholder({ title, icon = "🚧", description, onBack }) {
  return (
    <div style={{ 
      minHeight: "calc(100vh - 68px)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "linear-gradient(180deg, #1c1510 0%, #15100a 100%)",
      padding: "24px",
      fontFamily: "'DM Sans', sans-serif",
      color: "rgba(245,240,232,0.6)",
    }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        <div style={{ fontSize: "56px", marginBottom: "20px" }}>{icon}</div>
        <h2 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: "24px", 
          margin: "0 0 12px 0",
          color: "#f5f0e8"
        }}>{title}</h2>
        <p style={{ margin: "0 0 28px 0", fontSize: "15px", opacity: 0.8 }}>{description}</p>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid rgba(184,134,11,0.3)",
              borderRadius: "8px",
              color: "rgba(245,240,232,0.7)",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.background = "rgba(184,134,11,0.1)"; 
              e.currentTarget.style.borderColor = "rgba(184,134,11,0.5)";
              e.currentTarget.style.color = "#f0c040";
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.background = ""; 
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.color = "";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

export default App;