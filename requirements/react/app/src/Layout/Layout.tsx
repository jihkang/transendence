import { useNavigate } from "react-router-dom";
import { useUserStore } from "../User/UserStore";
import { Button, HStack } from "@chakra-ui/react";

const Layout = () => {
  const move = useNavigate();
  const { userId, chatSocket, setRoomId, roomId, logOut } = useUserStore(
    (state) => state
  );

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    let { value } = e.currentTarget;
    if (roomId && chatSocket) {
      chatSocket.emit("leave-room", {
        roomId,
      });
      setRoomId("");
    }
    if (value === "record") {
      value += `/${localStorage.getItem("id")}`;
    }
    move("/" + value, {
      state: {
        targetId: userId,
      }
    });
  };

  const logout = () => {
    if (roomId && chatSocket) {
      chatSocket.emit("leave-room", {
        roomId,
      });
    }
    logOut(move);
  };

  return (
    <HStack
      spacing={3}
      borderBottom={"1px solid"}
      m="3"
      p="4"
      justifyContent={"space-between"}
    >
      <HStack>
        <Button onClick={logout}>LogOut</Button>
        <Button value={"home"} onClick={onClick}>
          Home
        </Button>
        <Button value={"dm"} onClick={onClick}>
          DM
        </Button>
        <Button value={"record"} onClick={onClick}>
          Record
        </Button>
      </HStack>
      <Button onClick={onClick} value="profile">
        Profile
      </Button>
    </HStack>
  );
};

export default Layout;
