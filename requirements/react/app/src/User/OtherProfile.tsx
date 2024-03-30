import imga from "../image/123.png";
import Layout from "../Layout/Layout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUserStore } from "./UserStore";
import { customAxios } from "./customAxios";

// image, nick, rating? , auth, 전적

const OtherProfile = () => {
  const { nick, twoFactor, img, toId, logOut } = useUserStore();
  const move = useNavigate();
  const [toIdNick, setToIdNick] = useState("");
  const [image, setImage] = useState("");

  const getOtherUser = async () => {
    try {
      const response = await customAxios.get(`user/other/${toId}`);
      console.log(response);
      setImage(response.data.profileUrl);
      setToIdNick(response.data.nick);
    } catch (error) {
      logOut(move);
    }
  };

  useEffect(() => {
    getOtherUser();
  }, []);

  return (
    <>
      <Layout />
      <div>
        <img src={image} alt="Preview" />
      </div>
      <ol>
        <li>닉네임:{toIdNick}</li>
        <button onClick={() => move(`/record/${toId}`, {
          state: {
            targetId: toId
          }
        })}>전적</button>
      </ol>
    </>
  );
};

export default OtherProfile;
