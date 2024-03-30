import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-oauth2';
import {AuthService} from '../auth.service';

@Injectable()
export class FTStrategy extends PassportStrategy(Strategy, 'ft') {
	constructor(private authService: AuthService) {
		super({
			clientID: process.env.CLIENTID,
			clientSecret: process.env.CLIENTSECRET,
			callbackURL: process.env.REDIRECTURI,
			authorizationURL: `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.CLIENTID}&redirect_uri=${process.env.CLIENTSECRET}&response_type=code`,
			tokenURL: 'https://api.intra.42.fr/oauth/token',
		});
	}

	async validate(accessToken) {
			return this.authService.authUser(accessToken);
	}
}
