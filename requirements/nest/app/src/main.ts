import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.enableCors({
		origin: 'http://localhost:42421',
		credentials: true,
	});
	// app.enableCors({origin: 'http://localhost:42421'});
	// app.useWebSocketAdapter(new SocketIoAdapter(app));
	const port = process.env.BACK_PORT;
	if (!port) return;
	await app.listen(port);
}
bootstrap();
