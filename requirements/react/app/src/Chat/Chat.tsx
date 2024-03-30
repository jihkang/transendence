import React, { useEffect, useRef, useState } from "react";
import User from "../List/User";
import Layout from "../Layout/Layout";
import { useUserStore } from "../User/UserStore";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Button,
	Flex,
	HStack,
	Input,
	Text,
	InputGroup,
	InputRightAddon,
	List,
} from "@chakra-ui/react";
import { StartDto } from "../Game/LoadGame";

export interface chatSocket {
	state: string;
	userNick: string;
	reason: string;
	message: string;
	target: string;
	targetNick: string;
}

const Chat: React.FC = () => {
	const [messages, setMessages] = useState<string[]>(["Welcome"]);
	const [inputValue, setInputValue] = useState("");
	const { chatSocket, gameSocket, roomId, userId } = useUserStore((state) => state);
	const move = useNavigate();
	const ref = useRef<HTMLUListElement>(null);

	const inviteUser = (data: string[]) => {
		console.log(chatSocket)
		console.log(gameSocket)
		chatSocket?.emit("check-user", {
			target: data[1],
			roomId: roomId,
		}, (res: boolean) => {
			if (res) {
				move('/home/Load', {
					state: {
						type: "custom",
						speed: 2,
						targetChat: data[1],
						chatRoomId: roomId,
					}
				})
			}
		})
	};

	useEffect(() => {
		if (chatSocket) {
			chatSocket.on("join-room", (data: chatSocket) => {
				if (!data.state) {
					setMessages((messages) => [...messages, `${data.userNick} join room`]);
				}
			});
			chatSocket.on("leave-room", (data: chatSocket) => {
				if (!data.state) {
					setMessages((messages) => [...messages, `${data.userNick} leave room`]);
				}
				if (data.state === "Success") {
					move("/home");
				} else if (data.state === "Fail") {
					console.log(data.reason);
				}
			});
			chatSocket.on("message", (data: chatSocket) => {
				if (!data.state) {
					setMessages((messages) => [
						...messages,
						`${data.userNick} : ${data.message}`,
					]);
				} else if (data.state === "Success") {
					setMessages((messages) => [...messages, `You : ${data.message}`]);
				} else if (data.state === "Fail") {
					alert(data.reason);
					setMessages((messages) => [
						...messages,
						`send fail why ${data.reason}`,
					]);
				}
				setInputValue("");
			});
			chatSocket.on("kick", (data: chatSocket) => {
				if (!data.state) {
					if (userId === data.target) move("/home");
					setMessages((messages) => [
						...messages,
						`${data.targetNick} kicked room`,
					]);
				} else if (data.state === "Success") {
					setMessages((messages) => [
						...messages,
						`${data.targetNick} kick Success`,
					]);
				} else if (data.state === "Fail") {
					console.log(data.reason);
				}
			});
			chatSocket.on("mute", (data: chatSocket) => {
				if (!data.state) {
					console.log(data.userNick);
					setMessages((messages) => [
						...messages,
						`${data.targetNick} mute room`,
					]);
				} else if (data.state === "Success") {
					console.log(data.state);
					setMessages((messages) => [
						...messages,
						`${data.targetNick} mute Success`,
					]);
				} else if (data.state === "Fail") {
					alert(data.reason);
				}
			});
			chatSocket.on("ban", (data: chatSocket) => {
				if (!data.state) {
					if (userId === data.target) {
						alert("You got banned");
						move("/home");
					}
					setMessages((messages) => [
						...messages,
						`${data.targetNick} ban room`,
					]);
				} else if (data.state === "Success") {
					setMessages((messages) => [
						...messages,
						`${data.targetNick} ban Success`,
					]);
				} else if (data.state === "Fail") {
					alert(data.reason);
				}
			});
			chatSocket.on("make-admin", (data: chatSocket) => {
				if (!data.state) {
					setMessages((messages) => [
						...messages,
						`you became an admin by ${data.userNick}`,
					]);
				} else if (data.state === "Success") {
					console.log(data.state);
					setMessages((messages) => [
						...messages,
						`${data.targetNick} was became an admin by you`,
					]);
				} else if (data.state === "Fail") {
					console.log(data.state);
					setMessages((messages) => [
						...messages,
						`cmd: makeAdmin failed for ${data.reason}`,
					]);
				}
			});
			chatSocket.on("make-user", (data: chatSocket) => {
				if (!data.state) {
					setMessages((messages) => [
						...messages,
						`you became an user by ${data.userNick}`,
					]);
				} else if (data.state === "Success") {
					console.log(data.targetNick);
					setMessages((messages) => [
						...messages,
						`${data.targetNick} was became an user by you`,
					]);
				} else if (data.state === "Fail") {
					console.log(data.state);
					setMessages((messages) => [
						...messages,
						`cmd: makeUser failed for ${data.reason}`,
					]);
				}
			});
			chatSocket.on("set-pass", (data: chatSocket) => {
				if (data.state === "Success") {
					console.log(data.state);
					setMessages((messages) => [...messages, `Room pass changed`]);
				} else if (data.state === "Fail") {
					console.log(data.state);
					setMessages((messages) => [
						...messages,
						`cmd: setPass failed for ${data.reason}`,
					]);
				}
			});
			chatSocket.on("destroy-room", (data: chatSocket) => {
				if (!data.state || data.state === "Success") {
					setMessages((messages) => [
						...messages,
						`room destroyed by ${data.userNick}`,
					]);
					move("/home");
				} else if (data.state === "Fail") {
					console.log(data.state);
					setMessages((messages) => [
						...messages,
						`cmd: destroyRoom failed for ${data.reason}`,
					]);
				}
			});
		}
		if (gameSocket) {
			gameSocket.on("invite-room", (res) => {
				console.log('will be invited')
				console.log("invite", res);
				if (window.confirm("invited?")) {	
					gameSocket.emit("join-room", {
						roomId: res.roomId,
					});
					move("/home/Load", {
						state: {
							type: "custom",
							roomId: res.roomId,
							userLeft: res.userLeft,
							userRight: res.userRight,
							chatRoomId : roomId,
						}
					})
				} else {
					gameSocket.emit("invite-reject", {
						roomId: res.roomId,
					})
				}
			})
			// gameSocket.on("start-game", (res: StartDto) => {
			// 	move("/home/Load", {
			// 		state: {
			
			// 		}
			// 	})
			// });
		}
		return () => {
			if (chatSocket) {
				chatSocket.off("leave-room")
				chatSocket.off("message")
				chatSocket.off("kick")
				chatSocket.off("mute")
				chatSocket.off("ban")
				chatSocket.off("make-admin")
				chatSocket.off("make-user")
				chatSocket.off("set-pass")
				// chatSocket.off("check-user");
				chatSocket.off("destroy-room")
			}
			if (gameSocket) {
				gameSocket.off("invite-room");
				gameSocket.off("start-game");
			}
		}
	}, [chatSocket, gameSocket]);

	useEffect(() => {
		if (ref?.current?.scrollHeight)
			ref?.current?.scrollTo(0, ref?.current?.scrollHeight - 30);
	}, [messages]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (inputValue[0] === "/" && chatSocket) {
			const str = inputValue.split(" ");
			const cmd = str[0].substring(1);
			switch (cmd) {
				case "kick":
				case "ban":
					chatSocket.emit(cmd, {
						roomId,
						target: str[1],
					});
					break;
				case "makeAdmin":
				case "makeUser":
					chatSocket.emit("make-" + cmd.substring(4).toLowerCase(), {
						roomId,
						target: str[1],
					});
					break;
				case "mute":
					chatSocket.emit(cmd, {
						roomId,
						target: str[1],
						time: +str[2],
					});
					break;
				case "setPass":
					chatSocket.emit("set-pass", {
						roomId,
						pass: str[1],
					});
					break;
				case "destroyRoom":
					chatSocket.emit("destroy-room", {
						roomId,
					});
					break;
				case "inviteRoom":
					inviteUser(str);
					break;
			}
		} else if (inputValue.trim() !== "") {
			chatSocket?.emit("message", {
				roomId,
				message: inputValue,
			});
		}
		setInputValue("");
	};

	const handleLeave = () => {
		chatSocket?.emit("leave-room", {
			roomId,
		});
	};


	return (
		<>
			<Layout />
			<HStack justifyContent={"space-between"} m="5">
				<User />
				<Button onClick={handleLeave}>x</Button>
			</HStack>
			<List overflow="scroll" maxH="500px" width="100%" ref={ref}>
				{messages.map((message, index) => {
					const nick = message.split(" ")[0] === "You";
					return (
						<Box
							border="1px solid"
							borderRadius="2xl"
							key={index}
							textAlign={nick ? "right" : "left"}
							p="2"
							ml="10"
							mr="10"
							mb="5"
							whiteSpace="normal"
						>
							<Text display="inline-block" maxW="200px">
								{message}
							</Text>
						</Box>
					);
				})}
			</List>
			<Flex width="100vw" height="20%" position="fixed" bottom="0">
				<form onSubmit={handleFormSubmit} className="chat">
					<InputGroup>
						<Input
							minW="100%"
							type="text"
							value={inputValue}
							onChange={handleInputChange}
						/>
						<InputRightAddon as={"button"}>Send</InputRightAddon>
					</InputGroup>
				</form>
			</Flex>
		</>
	);
};

export default Chat;
