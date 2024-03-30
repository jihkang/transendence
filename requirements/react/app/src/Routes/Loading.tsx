import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useUserStore } from "../User/UserStore";

const Loading = () => {
  const move = useNavigate();
  const { setUserId, cookies } = useUserStore();
  useEffect(() => {
    if (cookies) {
      localStorage.setItem("id", cookies.id);
      localStorage.setItem("login", cookies.state);
    }
    setTimeout(() => {
      if (cookies) setUserId(cookies?.id);
      switch (cookies?.state) {
        case "initialize":
          move("/setProfile");
          return;
        case "login":
          move("/home");
          return;
        case "twoFactor":
          move("/twoFactor");
          return;
      }
      move("/login");
    }, 1000);
  });
  return <div>Loading</div>;
};

export default Loading;
