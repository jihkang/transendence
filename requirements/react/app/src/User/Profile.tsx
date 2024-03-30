import imga from "../image/123.png";
import Layout from "../Layout/Layout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserStore } from "./UserStore";
import { customAxios } from "./customAxios";
import { Button } from "@chakra-ui/react";

// image, nick, rating? , auth, 전적

const Profile = () => {
  const { nick, setNick, userId, twoFactor, logOut } = useUserStore();
  const move = useNavigate();
  const [image, setImage] = useState("");
  const [mmr , setMmr] = useState("");

  const getUser = async () => {
    try {
      const response = await customAxios.get("user");
      console.log(response);
      setImage(response.data.profileUrl);
      setNick(response.data.nick);
    } catch (error) {
      logOut(move);
    }
  };

  useEffect(() => {
    getUser();
  }, []);
  const handleEdit = () => {
    move("/EditProfile");
  };

  const handleRecord = () => {
    move(`/record/${userId}`, {state: {
      targetId: userId,
    }});
  };

  return (
    <>
      <Layout />
      <div className="profile">
        <img className="preview-image" src={image} alt="Preview" />
      </div>
      <ol className="list">
        <li>닉네임:{nick}</li>
        <li>
          2차인증:
          {twoFactor ? (
            <span>O</span>
          ) : (
            <>
              <span>X</span>
            </>
          )}
        </li>
        <Button onClick={handleRecord}>전적</Button>
        <Button onClick={handleEdit}>수정</Button>
      </ol>
    </>
  );
};

export default Profile;
