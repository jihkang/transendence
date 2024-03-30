import { ArgumentsHost, Catch } from '@nestjs/common';
import {BaseWsExceptionFilter, WsException} from '@nestjs/websockets';

@Catch()
export class SocketExceptionFilter extends BaseWsExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		// super.catch(exception, host);
		console.log(exception);
	  }
}
