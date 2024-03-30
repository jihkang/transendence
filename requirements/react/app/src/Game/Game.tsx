import { MutableRefObject, RefObject, useEffect, useRef, useState } from "react";
import { useUserStore } from "../User/UserStore";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
	Box,
	Button,
	ButtonGroup,
	Flex,
	FormControl,
	HStack,
	Heading,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	Select,
	Text,
	VStack,
	useDisclosure,
} from "@chakra-ui/react";
import { chatSocket } from "../Chat/Chat";
import { Socket } from "socket.io-client";

type RoomType = {
	speed: string;
};

type RoomDto = {
	roomId: string;
	user: string;
	speed: number;
	visible? : boolean;
}

interface List {
	roomName: string;
	roomId: string;
	userCount: number;
}

interface CanvasInfo {
	refs: RefObject<HTMLCanvasElement>;
	roomId: string;
	userLeft : string;
	userRight : string;
}

type GameSocket = {
	board: {
		left: {
			x: number;
			y: number;
			key: string;
			score: number;
		};
		right: {
			x: number;
			y: number;
			key: string;
			score: number;
		};
	};
	ball: {
		x: number;
		y: number;
		left: string;
		right: string;
	};
};

const useInterval = (callback: (props: any) => any, delay: number | null) => {
	const saveCallback = useRef<Function | null>();

	useEffect(() => {
		saveCallback.current = callback;
	}, [callback]);

	useEffect(() => {
		const executeCallback = () => {
			if (saveCallback && saveCallback.current) {
				saveCallback.current();
			}
		}
		if (delay === null) {
			delay = 400;
		}
		const timerId = setInterval(executeCallback, delay);
		return () => {
			clearInterval(timerId);
		}
	}, [delay])
}

const CanvasRef = ({ refs, roomId, userLeft, userRight }: CanvasInfo) => {
	const { gameSocket } = useUserStore();
	const gameSend = () => {
		if (gameSocket) {
			gameSocket?.emit("render", {
				roomId: roomId
			});
			gameSocket?.on("render", (data: GameSocket) => {
				const canvas = refs.current;

				if (canvas && data?.board) {
					const ctx = canvas.getContext("2d");
					const { board: { left, right }, ball } = data;
					ctx?.clearRect(0, 0, 640, 480);
					ctx?.beginPath();
					ctx?.fillRect(0, left?.y - 20, 10, 40);
					ctx?.closePath();
					ctx?.beginPath();
					ctx?.fillRect(right?.x, right?.y - 20, 10, 40);
					ctx?.closePath();
					ctx?.beginPath();
					ctx?.arc(ball?.x, ball?.y, 20, 0, 2 * Math.PI);
					ctx?.fill();
					ctx?.closePath();
					ctx?.strokeText(`${userLeft} ${left?.score} : ${right?.score} ${userRight}`, 200, 50, 200);
				}
			});
		}
	}
	useInterval(gameSend, 40);

	return (
		<Box width="640px" height="480px" m="0 auto">
			<canvas ref={refs} width="640px" height="480px" />
		</Box>
	);
};

const GamePlay = () => {
	const cRef = useRef<HTMLCanvasElement>(null);
	const [score, setScore] = useState("0 : 0");
	const { gameSocket } = useUserStore();
	const move = useNavigate();
	const {
		state: { roomId,
			userLeft,
			userRight}
	} = useLocation();
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			const { key } = e;
			switch (key) {
				case "ArrowUp":
					gameSocket?.emit("key-in", {
						roomId: roomId,
						key: "ArrowUp"
					});
					break;
				case "ArrowDown":
					gameSocket?.emit("key-in", {
						roomId: roomId,
						key: "ArrowDown"
					});
					break;
				default:
					break;
			}
		}
		window.addEventListener("keydown", handler);
		gameSocket?.on("end-game", () => {
			move("/home");
		})
		return () => {
			gameSocket?.off("end-game");
			window.removeEventListener("keydown", handler);
		}
	}, [gameSocket])

	return (
		<>
			<Flex flexDir={"column"}>
				<CanvasRef refs={cRef} roomId={roomId} userLeft={userLeft} userRight={userRight} />
			</Flex>
		</>
	);
};

const Game = () => {
	const { isOpen, onClose, onOpen } = useDisclosure();
	const { gameSocket, nick } = useUserStore();
	const move = useNavigate();
	const [data, setData] = useState<RoomType>({
		speed: "2",
	});
	const [roomList, setRoomList] = useState<RoomDto[]>([]);
	const onChange = (
		e:
			| React.ChangeEvent<HTMLSelectElement>
			| React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, value } = e.currentTarget;
		setData({
			...data,
			[name]: value,
		});
	};

	useEffect(() => {
		gameSocket?.emit("get-rooms");
		gameSocket?.on("get-rooms", (ret: RoomDto[]) => {
			console.log(ret);
			console.log("get rooms!!");
			setRoomList([...ret]);
		});
		return () => {
			gameSocket?.off("get-rooms");
		}
	}, [gameSocket]);

	return (
		<VStack justifyContent={"align-items"} position="relative">
			<FormControl>
				<ButtonGroup>
					<Button
						value="Ladder"
						onClick={() => {
							move("Load", {
								state: {
									type: "ladder",
								},
							});
						}}
					>
						Ladder
					</Button>
					<VStack>
						<Button value="Custom" onClick={onOpen}>
							Custom
						</Button>
						<Modal isOpen={isOpen} onClose={onClose}>
							<ModalContent>
								<ModalBody m="0 auto">
									<label>배속</label>
									<Select
										placeholder="Select game speed"
										onChange={onChange}
										name="speed"
										defaultValue={"2"}
									>
										<option value="1">1배속</option>
										<option value="2">2배속</option>
										<option value="4">4배속</option>
									</Select>
								</ModalBody>
								<ModalFooter>
									<Button
										onClick={() => {
											move("Load", {
												state: {
													type: "custom",
													speed: +data.speed,
												},
											});
										}}
									>
										Create Room
									</Button>
								</ModalFooter>
							</ModalContent>
						</Modal>
						{roomList?.filter((list: RoomDto) => {
							return list.user !== nick
						})
							?.map((list: RoomDto) => {
								return (
									<Box as="button" key={`game_room_${list.roomId}`} onClick={() => {
										move("Load", {
											state: {
												type: "custom",
												roomId: list.roomId,
											},
										});
									}}>
										<Text>{list.user}</Text>
									</Box>
								);
							})}
					</VStack>
				</ButtonGroup>
				<HStack></HStack>
			</FormControl>
		</VStack>
	);
};

export { Game, GamePlay };
