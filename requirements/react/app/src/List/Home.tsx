import React, { useEffect } from "react";
import Layout from "../Layout/Layout";
import User from "../List/User";
import Room from "../List/Room";
import { Button, Flex } from "@chakra-ui/react";
import { useUserStore } from "../User/UserStore";
import { useNavigate } from "react-router-dom";
import { StartDto } from "../Game/LoadGame";

const Home = () => {
	const { gameSocket } = useUserStore();
	const move = useNavigate();

	useEffect(() => {
		gameSocket?.emit("page");
		if (gameSocket) {
			gameSocket?.on("invite-room", (res) => {
				console.log('will be invite')
				console.log("invite", res);
				if (window.confirm("invited?")) {
					gameSocket.emit("join-room", {
						roomId: res.roomId,
					});
				} else {
					console.log("reject");
					gameSocket.emit("invite-reject", {
						roomId: res.roomId,
					})}
			})
			gameSocket?.on("start-game", (res: StartDto) => {
				move("/Home/Game", {
					state: {
						type: "custom",
						roomId: res.roomId,
						userLeft: res.userLeft,
						userRight: res.userRight
					}
				})
			});
		  }

		return () => {
			gameSocket?.off("invite-room")
			gameSocket?.off("start-game")
		}
	}, [gameSocket]);
	
	return (
		<Flex
			flexDir="column"
			width="100%"
			minH="100%"
			maxHeight={"100%"}
			h="100%"
			overflow="hidden"
		>
			<Layout />
			<Flex flexDir="row" justifyContent={"space-between"}>
				<Room />
				<User />
			</Flex>
		</Flex>
	);
};

export default Home;
