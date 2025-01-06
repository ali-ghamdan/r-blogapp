import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { authStore, notificationsStore } from "./lib/stores";
import LoginPage from "./pages/loginPage";
import HomePage from "./pages/homePage";
import Notification from "./components/notification";
import PostPage from "./pages/postPage";
import NotFound from "./components/notFound";
import ListPosts from "./components/listPosts";

function App() {
  const { auth } = authStore();
  const { notifications } = notificationsStore();

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={auth ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/post/:id"
            element={auth ? <PostPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/search"
            element={
              auth ? <ListPosts type="SEARCH" /> : <Navigate to="/login" />
            }
          />
          <Route path="/login" element={<LoginPage isRegister={false} />} />
          <Route path="/register" element={<LoginPage isRegister={true} />} />
          <Route path="*" Component={NotFound} />
        </Routes>
      </BrowserRouter>
      <div className="notification-center">
        {notifications.slice(0, 4).map((noti, index) => {
          return (
            <Notification
              title={noti.title}
              message={noti.message}
              type={noti.type}
              id={index + 1}
              key={index + 1}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
