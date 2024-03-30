import { Flex, Button, Heading } from "@chakra-ui/react";
import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../User/UserStore";


export type StartDto = {
	roomId: string,
	status?: string;
	userLeft: string;
	userRight: string;
}

export const LoadGame = () => {
	const { gameSocket, chatSocket } = useUserStore();
	const {
		state: { type, speed, roomId, targetId, targetChat, chatRoomId },
	} = useLocation();
	const move = useNavigate();

	useEffect(() => {
		gameSocket?.on("start-game", (res: StartDto) => {

			chatSocket?.emit("leave-room", {
				roomId: chatRoomId,
			});
			
			move("/Home/Game", {
				state: {
					type: type,
					roomId: roomId ? roomId : res.roomId,
					userLeft: res.userLeft,
					userRight: res.userRight
				}
			})
		});
		gameSocket?.on("end-game", (res) => {
			console.log(res);
			move("/home");
		})
		if (speed && type) {
			if (targetId === undefined && targetChat === undefined) {
				gameSocket?.emit("create-room", {
					speed: +speed,
					visible : true
				});
			} else {
				gameSocket?.emit("create-room", {
					speed:+speed,
				})
			}
			gameSocket?.on("create-room", (res: StartDto) => {
				console.log(res);
				switch (res.status) {
					case "fail":
						move("/home");
						break;
					case 'success':
						if (targetId)  {
							gameSocket?.emit("invite-room", {
								targetId: +targetId,
								roomId: res.roomId, 
							})
						} else if (targetChat) {
							chatSocket?.emit("leave-room", {
								roomId: chatRoomId,
							});
							console.log("invite chatting room user")
							gameSocket?.emit("invite-room-chat", {
								nick: targetChat,
								roomId: res.roomId, 
							})
						}
					break;
				}
			})
		}
		else if (type && type === "ladder") {
			gameSocket?.emit("match-making");
		}
		else if (type && type === "custom") {
			gameSocket?.emit("join-room", {
				roomId: roomId,
			})
		}

		return () => {
			gameSocket?.off("create-room")
			gameSocket?.off("end-game")
			gameSocket?.off("start-game")
		}
	}, [gameSocket]);



	return (
		<Flex minH="100vh"justify={"center"} alignItems={"center"} flexDir={"column"}>
			<Link to="/home">
				<Button>
					Home
				</Button>
			</Link>
			<Heading>loading...</Heading>
		</Flex>
	);
};
