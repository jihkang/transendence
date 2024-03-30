import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "../User/Login";
import EditProfile from "../User/EditProfile";
import TwoFactor from "../User/TwoFactor";
import Home from "../List/Home";
import Profile from "../User/Profile";
import SetProfile from "../User/SetProfile";
import Chat from "../Chat/Chat";
import DM from "../Chat/DM";
import Record from "../List/Record";
import { useEffect, useState } from "react";
import { useUserStore } from "../User/UserStore";
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import PrivateRoute from "./PrivateRoute";
import Loading from "./Loading";
import OtherProfile from "../User/OtherProfile";
import { GamePlay  } from "../Game/Game";
import { LoadGame } from "../Game/LoadGame";

interface Token {
  id: string;
  nick: string;
  state: string;
}

const Router = () => {
  useUserStore((state) => state);
  const move = useNavigate();
  const [cookie] = useCookies(["Auth"]);
  const token = cookie["Auth"];


  const { nick, setNick, userId, setUserId, setCookies, setCookie } = useUserStore(
    (state) => state
  );

  useEffect(() => {
    if (token) {
		setCookie(cookie);
		const decodeToken: Token = jwt_decode(token);
		setCookies(decodeToken);
      if (!userId) setUserId(decodeToken.id);
	  if (!nick) setNick(decodeToken.nick);
    }
  }, []);

  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="EditProfile" element={<EditProfile />} />
        <Route path="TwoFactor" element={<TwoFactor />} />
        <Route path="Home" element={<Home />} />
        <Route path="Home/Load" element={<LoadGame />} />
        <Route path="Home/Game" element={<GamePlay />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="OtherProfile/:id" element={<OtherProfile />} />
        <Route path="Chat" element={<Chat />} />
        <Route path="DM" element={<DM />} />
        <Route path="Record/:id" element={<Record />} />
        <Route path="SetProfile" element={<SetProfile />} />
      </Route>
      <Route path="Loading" element={<Loading />} />
      <Route path="Login" element={<Login />} />
      <Route path="/" element={<Loading />} />
    </Routes>
  );
};
export default Router;
