import { Box, Button, Center, Flex, useColorMode } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "./UserStore";
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";

function Login() {
  const onclick = () => {
    window.location.replace(process.env.REACT_APP_SERVER_IP + "/auth");
  };

  return (
    <Flex
      minH="100vh"
	  minW="200px"
      m="0 auto"
      alignItems="center"
      justifyContent={"center"}
    >
      <Button variant={"ghost"} onClick={onclick} minW="inherit" w="inherit" h="150px" border={"1px solid"} borderRadius="3xl">
        로그인
      </Button>
    </Flex>
  );
}

export default Login;
