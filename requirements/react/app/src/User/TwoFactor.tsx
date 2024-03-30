import React, { useEffect, useState } from "react";
import { customAxios } from "./customAxios";
import { useNavigate } from "react-router-dom";
import { Button, Center, Flex, Input } from "@chakra-ui/react";
import Timer from "./Timer";
import { useUserStore } from "./UserStore";

const TwoFactor: React.FC = () => {
  const [pass, setPass] = useState("");
  const [time, setTime] = useState(60);
  const { logOut } = useUserStore();
  const move = useNavigate();

  useEffect(() => {
    customAxios.get("/auth/twoFactor");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pass.length !== 6) {
      alert("6자리 숫자를 입력하세요");
      return;
    }
    try {
      const response = await customAxios.post("auth/twoFactor", {
        code: pass,
      });
      console.log(response);
      if (response.data === true) {
        window.location.replace(
          process.env.REACT_APP_SERVER_IP + "/auth/twoFactorLogin"
        );
      } else {
        alert("wrong pass");
      }
    } catch (error) {
      logOut(move);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, "");
    setPass(numericValue);
  };

  const handleRefresh = () => {
    setTime(60);
    customAxios
      .get("/auth/twoFactor")
      .then((response) => {})
      .catch((error) => {
        logOut(move);
      });
  };

  return (
    <Flex alignItems={"center"} justifyContent={"center"} minH="100vh">
      <form onSubmit={handleSubmit}>
        <Input type="text" value={pass} onChange={handleInput} />
        <Timer time={time} setTime={setTime} />
        <Button bg="green" alignItems={"center"} type="submit">
          submit
        </Button>
        <Button onClick={handleRefresh}>다시 보내기</Button>
      </form>
    </Flex>
  );
};

export default TwoFactor;
