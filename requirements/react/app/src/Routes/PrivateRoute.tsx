import { Flex } from "@chakra-ui/react";
import React, {
	ReactHTMLElement,
	useContext,
	useEffect,
	useState,
} from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useUserStore } from "../User/UserStore";
import { io } from "socket.io-client";
import { customAxios } from "../User/customAxios";
import { useCookies } from "react-cookie";
import jwt_decode from "jwt-decode";
import { StartDto } from "../Game/LoadGame";

interface Socket {
	roomId: string;
	state: string;
	reason: string;
}

interface Token {
	id: string;
	nick: string;
	state: string;
}

const PrivateRoute = () => {
	const [cookies] = useCookies(["Auth"]);
	const token = cookies["Auth"];
	const check = localStorage.getItem("login");
	const id = localStorage.getItem("id");
	const {
		userId,
		setUserId,
		nick,
		setNick,
		setImg,
		setTwoFactor,
		setRoomId,
		gameSocket,
		setGameSocket,
		chatSocket,
		setChatSocket,
		cookie,
		setCookie,
		setCookies,
		logOut,
	} = useUserStore();
	const move = useNavigate();
	const getUserData = async () => {
		try {
			const response = await customAxios.get("user");
			if (!userId) {
				console.log(response.data.id);
				setUserId(response.data.id);
			}
			if (!response.data.nick) {
				move("/SetProfile");
			}
			setNick(response.data.nick);
			setImg(response.data.profileUrl);
			console.log(response.data.nick);
			setTwoFactor(response.data.twoFactorAuth);
		} catch (error) {
			logOut(move);
		}
	};

	const makeSocket = () => {
		if (chatSocket && gameSocket) {
			if (check == "login" && !cookie) {
				setCookie(cookies);
				const decodeToken: Token = jwt_decode(token);
				setCookies(decodeToken);
				if (!userId) setUserId(decodeToken.id);
			}
			if (check === "login") {
				chatSocket?.on("connect", () => {
					if (check) {
						chatSocket.emit("add-list");
					}
				});
				gameSocket?.on("connect", () => {
					if (check) {
						gameSocket.emit("add-list");
					}
				});
				chatSocket?.on("disconnect", (err) => {
					console.log(err)
				});
				chatSocket?.on("error", (e) => {
					console.log("catch");
				});
				chatSocket?.on("create-room", (data: Socket) => {
					if (data.state === "Success") {
						setRoomId(data.roomId);
						move("/chat");
					} else if (data.state === "Fail") {
						console.log(data.reason);
					}
				});
				chatSocket?.on("join-room", (data) => {
					if (data.state === "Success") {
						move("/chat");
					} else if (data.state === "Fail") {
						alert("Banned room");
						setRoomId(null);
					}
				});
				chatSocket?.on("disconnect", () => { });
			}	
		}
	};

	useEffect(() => {
		console.log("1");
		if (!nick && nick !== undefined && nick !== "") {
			getUserData();
		}
	}, [cookie]);
	useEffect(() => {
		if (cookie) {
			const gameSockets = io(process.env.REACT_APP_SERVER_IP + "/game", {
				transports: ["websocket"],
				auth: cookie,
			});
			const chatSockets = io(process.env.REACT_APP_SERVER_IP + "/chat", {
				transports: ["websocket"],
				auth: cookie,
			});
			setGameSocket(gameSockets);
			setChatSocket(chatSockets);
		}
		if (!check) move("/login");
		if (check === "login") move("/home");
		else if (check === "initialize") move("/setProfile");
		else if (check === "twoFactor") move("/twoFactor");
		return () => {
			chatSocket?.disconnect();
		};
	}, [cookie]);

	useEffect(() => {
		makeSocket();
		return () => {
			chatSocket?.off("connect")
			gameSocket?.off("connect")
			chatSocket?.off("disconnect")
			chatSocket?.off("error")
			chatSocket?.off("create-room")
			chatSocket?.off("join-room")
			chatSocket?.off("disconnect")
		}
	}, [chatSocket, gameSocket]);
	return <Outlet />;
};

export default PrivateRoute;
