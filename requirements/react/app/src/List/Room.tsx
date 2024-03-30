import { useEffect, useState } from "react";
import { useUserStore } from "../User/UserStore";
import ChatList from "./ChatList";
import { Button } from "@chakra-ui/button";
import { Box, Flex } from "@chakra-ui/react";
import { redirect } from "react-router-dom";
import { Game } from "../Game/Game";

// room list

const Room = () => {
  const { chatSocket,gameSocket } = useUserStore();
  const [room, setRoom] = useState(false);

  const roomClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.innerText === "Game" && room === false) {
      return;
    }
    if (e.currentTarget.innerText === "Chat" && room === true) {
      return;
    }
    if (!room) {
      chatSocket?.emit("get-rooms");
    }
    setRoom(!room);
  };
  
  useEffect(() => {
	gameSocket?.emit("page");
  }, []);

  return (
    <Flex
      pr="10"
      minWidth="60%"
      maxWidth="70%"
      minH={"calc(100vh - 200px)"}
      className="Room"
      borderRight="1px"
      flexDir={"column"}
    >
      <Flex w="100%" justifyContent={"flex-end"} p="20 0" mb="10" ml="5" mr="5">
        <Button
          backgroundColor={room === false ? "red.100" : ""}
          w="50%"
          variant="ghost"
          onClick={roomClick}
        >
          Game
        </Button>
        <Button
          backgroundColor={room === true ? "red.100" : ""}
          w="50%"
          variant="ghost"
          onClick={roomClick}
        >
          Chat
        </Button>
      </Flex>
      <Flex
        justifyContent={"center"}
        alignItems="center"
        textAlign={"center"}
        minH="600px"
        maxH="800px"
        lineHeight="inherit"
        h="inherit"
      >
        {room ? <ChatList /> : <Game />}
      </Flex>
    </Flex>
  );
};

export default Room;
