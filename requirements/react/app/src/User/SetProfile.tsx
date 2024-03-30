import React, { useEffect } from "react";
import { useState } from "react";
import noimg from "../image/noimg.gif";
import { useNavigate } from "react-router-dom";
import { customAxios } from "./customAxios";
import { useUserStore } from "./UserStore";

function SetProfile() {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File>(noimg);
  const [preview, setPreview] = useState<string | undefined>(noimg);
  const move = useNavigate();
  const [twoFactor, setTwoFactor] = useState(false);
  const { logOut } = useUserStore();
  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImage(file);
      previewImage(file);
    } else {
      setImage(noimg);
      previewImage(noimg);
    }
  };

  const previewImage = (image: File) => {
    // if (!image) {
    //   setPreview(noimg);
    //   return;
    // }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(image);
    // console.log(image);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    if (image) {
      formData.append("image", image);
    }
    try {
      const response = await customAxios.post("user/updateTwoFactor", {
        twoFactor,
      });
      console.log(response);
    } catch (error) {
      // logOut(move);
      alert(error);
      return;
    }

    if (image !== noimg) {
      try {
        const response = await customAxios.post("user/updateProfile", formData);
        console.log(response);
      } catch (error) {
        // logOut(move);
        alert('Wrong Image Format');
        return;
      }
    }
    try {
      const response = await customAxios.post("/user/updateNick", {
        name,
      });
      if (response.data.state === "fail"){
        alert(response.data.reason);
        return;
      }
      window.location.replace(process.env.REACT_APP_SERVER_IP + "/auth/login");
    } catch (error) {
      // logOut(move);
      alert('Wrong Nickname Format');
      return;
    }
  };

  const handleCheck = () => {
    setTwoFactor(!twoFactor);
  };

  return (
    <>
      <form className="setProfile" onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" value={name} onChange={handleName} required />
        </div>
        <div>
          <label>2차인증</label>
          <input type="checkbox" onChange={handleCheck} />
          <input
            type="file"
            accept="image/jpg,image/png,image/jpeg,image/gif"
            name="profile_image"
            onChange={handleImage}
          ></input>
          {preview && <img className="preview" src={preview} alt="Preview" />}
        </div>
        <button type="submit">edit</button>
      </form>
    </>
  );
}

export default SetProfile;
