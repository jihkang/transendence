import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import User from "../List/User";
import { Button } from "@chakra-ui/react";
import Send from "./Send";
import Receive from "./Receive";

//note history

const DM = () => {
  const [sendRcv, setSendRcv] = useState(false);

  const handleSendRcv = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.innerText === "Send" && sendRcv === false) {
      return;
    }
    if (e.currentTarget.innerText === "Receive" && sendRcv === true) {
      return;
    }
    setSendRcv(!sendRcv);
  };
  return (
    <>
      <Layout />
      <Button onClick={handleSendRcv}>Send</Button>
      <Button onClick={handleSendRcv}>Receive</Button>
      {sendRcv ? <Receive /> : <Send />}
      <User />
    </>
  );
};

export default DM;
