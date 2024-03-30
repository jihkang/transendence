import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import { customAxios } from "../User/customAxios";
import { Box, Text, Button, Flex, Heading, HStack, VStack } from "@chakra-ui/react";
import { useUserStore } from "../User/UserStore";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

interface Data {
	id: string;
	nick: string;
}

interface Record {
	id: number;
	isRank: boolean;
	loser: Data;
	loserScore: number;
	winner: Data;
	winnerScore: number;
}

interface UserRecord {
	filtering: string;
	list: Record[];
}

const Record = () => {
	const { state: {targetId} } = useLocation();
	const [record, setRecord] = useState<UserRecord>({
		filtering: 'total',
		list: [],
	});
	const [nick, setNick] = useState("");
	const [mmr, setMmr] = useState(0);
	const move = useNavigate();
	const { logOut, gameSocket } = useUserStore();
	const getMmr = async () => {
		try {
			const response = await customAxios.get(`user/other/${targetId}`);
			console.log(response);
			setMmr(response.data.mmr);
		} catch (error) {
			logOut(move);
		}
	};

	const getUser = async () => {
		try {
			const response = await customAxios.get(`user/other/${targetId}`);
			console.log(response);
			setNick(response.data.nick);
		} catch (error) {
			logOut(move);
		}
	};

	const getRecord = async () => {
		try {
			const response = await customAxios.get(`record/${targetId}`);
			console.log(response.data);
			setRecord(
				{
					...record,
					list: response.data
				});
		} catch (error) {
			logOut(move);
		}
	};
	useEffect(() => {
		getMmr();
		if (targetId) {
			getUser();
			getRecord();
		}
		console.log("page");
		gameSocket?.emit("page");
	}, []);

	const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		const { value } = e.currentTarget;
		setRecord({
			...record,
			filtering: value,
		});
	};

	useEffect(() => {
	}, [record])

	return (
		<Flex
			flexDir="column"
			m="0 auto"
			minH="100vh"
			alignItems={"center"}
			justifyContent={"center"}
			gap="3"
		>
			<VStack>

			<Flex>
				<Button value="total" onClick={onClick}>
					total
				</Button>
				<Button value="rank" onClick={onClick}>
					rank
				</Button>
				<Button value="normal" onClick={onClick}>
					normal{" "}
				</Button>
			</Flex>
			<label>mmr : {mmr}</label>
			<HStack>
				<Heading>{nick}</Heading>
				<Link to="/home">
					<Button>
						Home
					</Button>
				</Link>
			</HStack>
			</VStack>
			<Flex gap="5" flexDir="column" width={"80%"}>
				{record && record.list?.length > 0 ? (
					record.list
						?.filter((item) => {
							return record.filtering === "total"
								? true
								: record.filtering === "rank" && item.isRank ? true :
									record.filtering === "normal" && !item.isRank ? true : false;
						})
						.map((item, index: number) => {
							return (
								<Box key={index} border='1px solid' width="80%">
									{item.isRank ? (
										<Heading>Rank</Heading>
									) : (
										<Heading>Normal</Heading>
									)}
									<Box>{item.winner.id === targetId ? "win" : "lose"}</Box>
									<Box>
										vs
										{item.winner.id === targetId
											? item.loser.nick
											: item.winner.nick}
									</Box>
									<Box>
										Score {item.winnerScore} : {item.loserScore}
									</Box>
								</Box>
							);
						})
				) : (
					<Heading
						as="button"
						onClick={() => {
							window.location.href =
								window.location.href.split("/record")[0] + "/home";
						}}
					>
						No game
					</Heading>
				)}
			</Flex>

		</Flex>
	);
};

export default Record;
