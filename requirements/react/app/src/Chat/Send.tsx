import { useEffect, useState } from "react";
import { customAxios } from "../User/customAxios";
import { Button } from "@chakra-ui/react";
import { useUserStore } from "../User/UserStore";
import { useNavigate } from "react-router-dom";

interface To {
  nick: string;
}

interface DM {
  to: To;
  text: string;
}

const Send = () => {
  const [sendDm, setSendDm] = useState<DM[]>();
  const { logOut } = useUserStore();
  const move = useNavigate();
  const sendData = async () => {
    try {
      const response = await customAxios.get("dm/send");
      setSendDm(response.data);
    } catch (error) {
      logOut(move);
    }
  };
  useEffect(() => {
    sendData();
  }, []);

  return (
    <>
      {sendDm &&
        sendDm.map((item, index) => (
          <div key={index}>
            to {item.to.nick} : {item.text}
          </div>
        ))}
    </>
  );
};

export default Send;
