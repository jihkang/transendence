import React, { useEffect, useState } from "react";
import { useUserStore } from "../User/UserStore";
import { useCookies } from "react-cookie";
import {
  Text,
  InputGroup,
  Box,
  Flex,
  InputLeftAddon,
  Input,
  Button,
  Heading,
  VStack,
  ButtonGroup,
} from "@chakra-ui/react";

const CreateRoom = ({ exit }: any): any => {
  const { chatSocket } = useUserStore();
  const [roomName, setRoomName] = useState("");
  const [realExit, setRealExit] = useState<boolean | null>(null);
  const [pass, setPass] = useState<string | undefined>("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(chatSocket);
    if (pass === "") {
      chatSocket?.emit(
        "create-room",
        {
          roomName,
        },
        (err: any) => {
          console.error(err);
        }
      );
    } else {
      chatSocket?.emit(
        "create-room",
        {
          roomName,
          pass,
        },
        (e: any) => {
          console.log(e);
        }
      );
    }
  };

  const handleRoomName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  };

  const handlePass = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPass(e.target.value);
  };

  useEffect(() => {
    const handlerExit = () => {
      if (realExit) exit(false);
    };
    window.addEventListener("click", handlerExit);
    return () => {
      window.removeEventListener("click", handlerExit);
    };
  }, [realExit]);

  return (
    <VStack
      m="20"
      p="40"
      border="1px solid"
      onSubmit={handleCreate}
      spacing="3"
      onMouseLeave={() => setRealExit(true)}
      onMouseEnter={() => setRealExit(false)}
    >
      <Heading>Settings</Heading>
      <InputGroup>
        <InputLeftAddon minW="150px" children="RoomName" />
        <Input value={roomName} onChange={handleRoomName} />
      </InputGroup>
      <InputGroup>
        <InputLeftAddon minW="150px" children="password" />
        <Input type="password" value={pass} onChange={handlePass} />
      </InputGroup>
      <ButtonGroup mt="20">
        <Button onClick={handleCreate}>Create</Button>
        <Button onClick={() => exit(false)}>show list</Button>
      </ButtonGroup>
    </VStack>
  );
};

export default CreateRoom;
