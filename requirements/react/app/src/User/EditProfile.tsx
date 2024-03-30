import React, { useState, useRef } from "react";
import Layout from "../Layout/Layout";
import { useNavigate } from "react-router-dom";
import { customAxios } from "./customAxios";
import { useUserStore } from "./UserStore";
import noimg from "../image/noimg.gif";

// name, image, auth

const EditProfile = () => {
  const move = useNavigate();
  const { nick, setNick, img, setImg, twoFactor, setTwoFactor, logOut } =
    useUserStore();
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | undefined>(undefined);
  const [preview, setPreview] = useState<string | undefined>(noimg);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [check, setCheck] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let formData = new FormData();
    if (image) formData.append("image", image);
    if (nick !== name && name !== "") {
      try {
        const response = await customAxios.post("/user/updateNick", {
          name,
        });
        if (response.data.state === "fail"){
          alert(response.data.reason);
          return;
        }
        setNick(name);
      } catch (error) {
        // logOut(move);
        alert('Wrong Nickname Format');
        return;
      }
    }
    if (img !== image) {
      try {
        const response = await customAxios.post(
          "/user/updateProfile",
          formData
        );
        setImg(image);
      } catch (error) {
        // logOut(move);
        alert('Wrong Image Format');
        return;
      }
    }
    if (twoFactor !== check) {
      try {
        const response = await customAxios.post("/user/updateTwoFactor", {
          twoFactor: check,
        });
        setTwoFactor(check);
      } catch (error) {
        logOut(move);
      }
    }
    move("/profile");
  };

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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

  const previewImage = (image: File | null) => {
    if (!image) {
      setImg(img);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(image);
  };

  const handleCheck = () => {
    setCheck(!check);
  };
  return (
    <>
      <Layout />
      <form className="edit" onSubmit={handleSubmit}>
        <div className="profile">
          <img
            className="preview-image"
            src={preview}
            alt="Preview"
            onClick={handleImageClick}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpg,image/png,image/jpeg"
            onChange={handleImage}
          />
        </div>
        <div className="list">
          <ol>
            <label>Name:</label>
            <input type="text" placeholder={nick} onChange={handleName} />
            <div>
              <label>2차인증</label>
              <input type="checkbox" onChange={handleCheck} />
            </div>
            <div>
              <button type="submit">edit</button>
            </div>
          </ol>
        </div>
      </form>
    </>
  );
};

export default EditProfile;
