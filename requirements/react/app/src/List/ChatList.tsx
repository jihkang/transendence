import { ReactNode, useEffect, useRef, useState } from "react";
import { useUserStore } from "../User/UserStore";
import { useNavigate } from "react-router-dom";
import CreateRoom from "../Chat/CreateRoom";
import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import { SocketReservedEventsMap } from "socket.io/dist/socket";
import { StartDto } from "../Game/LoadGame";

interface List {
  roomName: string;
  roomId: string;
  userCount: number;
}

interface Toggle {
  children: any;
  onToggle: (e? : any) => void;
}

export const Modal = ({ children, onToggle }: Toggle) => {
  const ref = useRef(null);
  const [exits, setExits] = useState(false);
  const [print, setPrint] = useState(true);

  useEffect(() => {
    const handlerModalClose = () => {
      if (exits) {
        setPrint(false);
        onToggle();
      }
    };
    window.addEventListener("click", handlerModalClose);
    return () => {
      ref.current = null;
      window.removeEventListener("click", handlerModalClose);
    };
  }, [exits]);

  return (
    <>
      {print && (
        <Box
          border="1px solid"
          ref={ref}
          onMouseEnter={() => {
            setExits(() => false);
          }}
          onMouseLeave={() => {
            setExits(() => true);
          }}
        >
          {children}
        </Box>
      )}
    </>
  );
};

const ChatList = () => {
  const move = useNavigate();
  const [create, setCreate] = useState(false);
  const { chatSocket, setRoomId, gameSocket } = useUserStore();
  const [pass, setPass] = useState<string | undefined>("");
  const [roomList, setRoomList] = useState<List[]>();
  const [modal, setModal] = useState<List>();

  useEffect(() => {
    chatSocket?.on("get-rooms", (data: List[]) => {
      setRoomList(data);
    });
  }, [roomList, modal]);

  const handlePass = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPass(e.target.value);
  };

  const handlePassSubmit = (e: React.FormEvent, item: List) => {
    e.preventDefault();
    joinRoom(item);
  };

  const joinRoom = (item: List) => {
    if (pass === "") {
      chatSocket?.emit(
        "join-room",
        {
          roomId: item.roomId,
        },
        (e: SocketReservedEventsMap) => {
          console.error(e);
        }
      );
    } else {
      chatSocket?.emit("join-room", {
        roomId: item.roomId,
        pass,
      });
    }
    setRoomId(item.roomId);
  };

  return (
    <Flex position="relative" display={"scroll"}>
      {create ? (
        <CreateRoom exit={setCreate} />
      ) : (
        <>
          <Flex flexDir="column" gap="3">
            {roomList?.map((item, index) => (
              <Box key={index} minW="400px" maxWidth="450px">
                <Button
                  width="100%"
                  onClick={() => {
                    if (modal === item) {
                      setModal(undefined);
                      return;
                    }
                    setModal(item);
                  }}
                >
                  {item.roomName} {item.userCount} /99
                </Button>
                {modal === item && (
                  <Modal
                    onToggle={() => {
                      setModal(undefined);
                    }}
                  >
                    <form onSubmit={(e) => handlePassSubmit(e, modal)}>
                      <Box>
                        <InputGroup>
                          <InputLeftAddon> pass :</InputLeftAddon>
                          <Input type="password" onChange={handlePass} />
                          <Button type="submit">입장</Button>
                        </InputGroup>
                      </Box>
                      <Button
                        onClick={() => {
                          setModal(undefined);
                        }}
                      >
                        닫기
                      </Button>
                    </form>
                  </Modal>
                )}
              </Box>
            ))}
          <Button
            // position={"fixed"}
            // bottom="20%"
            // left="50%"
            // className="create"
            onClick={() => {
              setCreate(true);
            }}
          >
            create room
          </Button>

          </Flex>
        </>
      )}
    </Flex>
  );
};

export default ChatList;
