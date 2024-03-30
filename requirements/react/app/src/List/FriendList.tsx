import { useEffect, useState } from "react";
import { useUserStore } from "../User/UserStore";
import { useNavigate } from "react-router-dom";
import { customAxios } from "../User/customAxios";
import { Box, Button, Flex, Heading, List } from "@chakra-ui/react";
import { Modal } from "./ChatList";
import { DmForm, TDm, TUser } from "./OnlineList";
import { StartDto } from "../Game/LoadGame";

interface Acted {
	nick: string;
	id: string;
	status: number;
}

interface User {
	acted: Acted;
}


const FriendList = () => {
	const move = useNavigate();
	const { userId, cookies, toId, setToId, logOut, gameSocket } = useUserStore();
	// const [modal, setModal] = useState(false);
	const [modal, setModal] = useState<User>();
	const [dmModal, setDmModal] = useState<TDm>();
	const [userList, setUserList] = useState<User[]>();
	const [menu, setMenu] = useState(false);
	const [message, setMessage] = useState("");
	const [isFriend, setIsFriend] = useState<boolean | undefined>();
	const [isBlock, setIsBlock] = useState<boolean | undefined>();

	const getFollowing = async () => {
		try {
			const response = await customAxios.get("relation/following");
			console.log(response.data);
			setUserList(response.data);
		} catch (error) {
			logOut(move);
		}
	};

	useEffect(() => {
		if (cookies) {
			getFollowing();
		}
	}, []);
	
	useEffect(() => {
		gameSocket?.on("invite-room", (res) => {
			console.log("invite", res);
			if (window.confirm("invited?")) {
				gameSocket.emit("join-room", {
					roomId: res.roomId,
				});
			}
		})
		gameSocket?.on("start-game", (res: StartDto) => {
			move("/Home/Game", {
				state: {
					type: "custom",
					roomId: res.roomId,
				}
			})
		});
		return () => {
			gameSocket?.off("invite-room");
			gameSocket?.off("start-game");
		};
	}, [gameSocket])

	const handleMenu = (e: React.MouseEvent<HTMLButtonElement>, item: User) => {
		e.preventDefault();
		const checkFollow = async () => {
			try {
				const response = await customAxios.get(
					`relation/checkFollow/${item.acted.id}`
				);
				if (!response.data) setIsFriend(false);
				else if (response.data === true) setIsFriend(true);
			} catch (error) {
				logOut(move);
			}
		};
		const checkBlock = async () => {
			try {
				const response = await customAxios.get(
					`relation/checkBlock/${item.acted.id}`
				);
				if (!response.data) setIsBlock(false);
				else if (response.data === true) setIsBlock(true);
			} catch (error) {
				logOut(move);
			}
		};
		setToId(item.acted.id);
		checkFollow();
		checkBlock();
		setMenu(!menu);
	};

	const handleSendMessage = async (e: React.FormEvent, message: string| undefined) => {
		e.preventDefault();

		try {
			const response = await customAxios.post("dm", {
				message,
				toId,
			});
			console.log(response);
		} catch (error) {
			logOut(move);
		}
		setMenu(false);
	};

	const deleteFriend = async () => {
		try {
			const response = await customAxios.post("relation/delete", {
				actedId: toId,
				follow: true,
			});
			console.log(response);
		} catch (error) {
			logOut(move);
		}

		setMenu(false);
	};

	const addBlock = async () => {
		try {
			const response = await customAxios.post("relation", {
				actedId: toId,
				follow: false,
			});
			console.log(response);
		} catch (error) {
			logOut(move);
		}
		setMenu(false);
	};

	const deleteBlock = async () => {
		try {
			const response = await customAxios.post("relation/delete", {
				actedId: toId,
				follow: false,
			});
			console.log(response);
		} catch (error) {
			logOut(move);
		}
		setMenu(false);
	};

	const handleProfile = () => {
		move(`/OtherProfile/${toId}`);
	};

	return (
		<>
		<Flex flexDir="column">
			<Heading>
				friends list			
			</Heading>
			{userList?.map((item, index) => (
				<Box key={index} minW="400px" maxWidth="450px">
					<Button
						width="100%"
						onContextMenu={(e) => {
							if (modal === item) {
								setModal(undefined);
								setToId(null);
								return;
							}
							handleMenu(e, item);
							setModal(item);
						}}
					>
						{item.acted.nick}
					</Button>
					<Box>
						{item.acted.status === 0 ? "online" : "offline"}
					</Box>
					{modal === item && (
						<Modal
							onToggle={(e) => {
								setModal(undefined);
								setDmModal(undefined);
							}}
						>
							<List>
								<Button onClick={handleProfile}>프로필</Button>
								<Button onClick={() => {
									if (dmModal) {
										setDmModal(undefined);
									} else {
										setDmModal({
											...{
												user: item.acted,
												message: "",
											}
										});
									}
								}}>
									DM
								</Button>
								{dmModal &&
									<Modal
										onToggle={() => {
											setDmModal(undefined)
										}}
									>
										<DmForm
											callback={handleSendMessage}
										/>
									</Modal>
								}
								{isBlock === true ? (
									<Button onClick={deleteBlock}>차단해제</Button>
								) : (
									<Button onClick={addBlock}>차단하기</Button>
								)}
								{isFriend === true && (
									<Button onClick={deleteFriend}>친구삭제</Button>
								)}
							</List>
						</Modal>
					)}
				</Box>
			))}
		</Flex>
		</>
	);
};
export default FriendList;
