import { useEffect, useState } from "react";
import { customAxios } from "../User/customAxios";
import { useUserStore } from "../User/UserStore";
import { useNavigate } from "react-router-dom";

interface From {
  nick: string;
}

interface DM {
  from: From;
  text: string;
}

const Send = () => {
  const [recvDm, setRecvDm] = useState<DM[]>();
  const { logOut } = useUserStore();
  const move = useNavigate();
  const recvData = async () => {
    try {
      const response = await customAxios.get("dm/recv");
      setRecvDm(response.data);
    } catch (error) {
      logOut(move);
    }
  };

  useEffect(() => {
    recvData();
  }, []);

  return (
    <>
      {recvDm &&
        recvDm.map((item, index) => (
          <div key={index}>
            from {item.from.nick} : {item.text}
          </div>
        ))}
    </>
  );
};

export default Send;
