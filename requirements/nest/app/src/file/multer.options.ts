import {BadRequestException} from '@nestjs/common';
import {existsSync, mkdirSync} from 'fs';
import {diskStorage} from 'multer';
import {extname} from 'path';
import {v4 as uuid} from 'uuid';

function uuidRandom(file): string {
	const uuidPath: string = `${uuid()}${extname(file.originalname)}`;
	return uuidPath;
}

export const multerOptions = {
	fileFilter: (request, file, callback) => {
		if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
			// 이미지 형식은 jpg, jpeg, png만 허용합니다.
			callback(null, true);
		} else {
			callback(new BadRequestException('Unexpected file type'), false);
		}
	},

	storage: diskStorage({
		destination: (request, file, callback) => {
			const uploadPath: string = '/public';

			if (!existsSync(uploadPath)) {
				mkdirSync(uploadPath);
			}
			callback(null, uploadPath);
		},

		filename: (request, file, callback) => {
			callback(null, uuidRandom(file));
		},
	}),

	limits: {
		fileSize: 1.28e8,
	},
};

export const createImageURL = (file): string => {
	const serverAddress: string = 'http://localhost:42422';
	return `${serverAddress}/${file.filename}`;
};
