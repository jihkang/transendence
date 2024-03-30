export enum Permission {
	Owner,
	Admin,
	User,
}

export class ChattingUser {
	id: number;
	clientId: string;
	permission: Permission;
	mute: number;
}
