import { useState } from "react";
import OnlineList from "./OnlineList";
import FriendList from "./FriendList";
import { Box, Button, Flex } from "@chakra-ui/react";

//user, friend list

const User = () => {
  const [user, setUser] = useState(false);

  const userClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.currentTarget.innerText === "Online" && user === false) {
      return;
    }
    if (e.currentTarget.innerText === "Friends" && user === true) {
      return;
    }
    setUser(!user);
    return;
  };
  return (
    <>
      <Box mr="10">
        <Button className="Button" onClick={userClick}>
          Online
        </Button>
        <Button className="Button" onClick={userClick}>
          Friends
        </Button>
        {user ? <FriendList /> : <OnlineList />}
      </Box>
    </>
  );
};

export default User;
