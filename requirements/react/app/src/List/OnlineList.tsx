import { RefObject, useEffect, useRef, useState } from "react";
import { useUserStore } from "../User/UserStore";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { customAxios } from "../User/customAxios";
import { Box, Button, Flex, Heading, List, Text } from "@chakra-ui/react";
import { Modal } from "./ChatList";

export type TUser = {
	id: string;
	nick: string;
}

export type TDm = {
	user: TUser,
	message: string;
};

interface UserList {
	onGame: TUser[],
	online: TUser[],
}

type TForm = {
	callback : (e : React.FormEvent, message?: string | undefined) => Promise<void>;
}

export const DmForm = ({callback}: TForm) => {

	const messageRef = useRef<HTMLInputElement>(null);
	const [message, setMessage] = useState("");

	const handleMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
		setMessage(e.target.value);
	};

	useEffect(() => {
		return () => {
			if (messageRef.current) {
				messageRef.current.value = "";
			}
		}
	}, [])


	return (
		<form onSubmit={(e) => callback(e, message)}>
			<label>message : </label>
			<input
				type="text"
				onChange={handleMessage}
				ref={messageRef}
			></input>
			<button type="submit" onClick={(e) => {
				callback(e, message);
				if (messageRef.current) {
					messageRef.current.value = ""
				}
			} }>보내기</button>
		</form>
	);
}

const OnlineList = () => {
	const move = useNavigate();
	const { cookies, toId, setToId, gameSocket, logOut } = useUserStore();
	const [modal, setModal] = useState<TUser>();
	const [dmModal, setDmModal] = useState<TDm>();
	const [userList, setUserList] = useState<UserList>();
	const [menu, setMenu] = useState(false);
	const [isFriend, setIsFriend] = useState<boolean | undefined>();
	const [isBlock, setIsBlock] = useState<boolean | undefined>();
	const messageRef = useRef<HTMLInputElement>(null);

	const getOnline = async () => {
		try {
			const response = await customAxios.get("user/onlineUser");
			setUserList({ ...response.data });
		} catch (error) {
			logOut(move);
		}
	};

	useEffect(() => {
		if (cookies) {
			getOnline();
		}
		gameSocket?.emit("pages");
	}, []);

	const handleSendMessage = async (e: React.FormEvent, message: string | undefined) => {
		e.preventDefault();
		console.log(toId, message)
		try {
			if (message !== "") {
				const response = await customAxios.post("dm", {
					message: message,
					toId : toId,
				});
				console.log(response);
			}
		} catch (error) {
			logOut(move);
		}
		setMenu(false);
	};

	const handleMenu = async (
		e: React.MouseEvent<HTMLButtonElement>,
		item: TUser
	) => {
		e.preventDefault();
		setToId(item.id);
		console.log(item.id)
		try {
			const response = await customAxios.get(`relation/checkFollow/${item.id}`);
			console.log(response);
			if (!response.data) {
				setIsFriend(false);
			} else if (response.data === true) {
				setIsFriend(true);
			}
		} catch (error) {
			logOut(move);
		}
		try {
			const response = await customAxios.get(`relation/checkBlock/${item.id}`);
			console.log(response);
			if (!response.data) {
				setIsBlock(false);
			} else if (response.data === true) {
				setIsBlock(true);
			}
		} catch (error) {
			logOut(move);
		}
		setMenu(!menu);
	};



	const addFriend = async () => {
		try {
			const response = await customAxios.post("relation", {
				actedId: toId,
				follow: true,
			});
		} catch (error) {
			logOut(move);
		}
		setModal(undefined);
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
		setModal(undefined);

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
		setModal(undefined);

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
		setModal(undefined);
	};

	const handleProfile = () => {
		move(`/OtherProfile/${toId}`);
	};

	const playGame = () => {
		move("/home/Load", {
			state: {
				type: "custom",
				speed: 2,
				targetId: toId,
			}
		})
	};

	return (
		<>
			<Flex gap="5" flexDir="column" mb="5">
				<Heading>
					게임중
				</Heading>
				{userList?.onGame?.map((item, index) => (
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
							{item.nick}
						</Button>
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
													user: item,
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
									{isFriend === true ? (
										<Button onClick={deleteFriend}>친구삭제</Button>
									) : (
										<Button onClick={addFriend}>친구추가</Button>
									)}
								</List>
							</Modal>
						)}
					</Box>
				))}
			</Flex>
			<Flex gap="5" flexDir="column">
				<Heading>
					온라인
				</Heading>
				{userList?.online?.map((item, index) => (
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
							{item.nick}
						</Button>
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
													user: item,
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
									{isFriend === true ? (
										<Button onClick={deleteFriend}>친구삭제</Button>
									) : (
										<Button onClick={addFriend}>친구추가</Button>
									)}
									<Button onClick={playGame}>게임하기</Button>
								</List>
							</Modal>
						)}
					</Box>
				))}
			</Flex>

		</>
	);
};
export default OnlineList;
