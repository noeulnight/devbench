import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DiscordService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public async getAccessToken(code: string) {
    const redirectUri = this.configService.get('DISCORD_REDIRECT_URI');
    const clientId = this.configService.get('DISCORD_CLIENT_ID');
    const clientSecret = this.configService.get('DISCORD_CLIENT_SECRET');

    const response = await firstValueFrom(
      this.httpService.post(
        '/oauth2/token',
        {
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        },
        {
          auth: {
            username: clientId,
            password: clientSecret,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return response.data.access_token;
  }

  public async getIdentity(accessToken: string) {
    const response = await firstValueFrom(
      this.httpService.get('/oauth2/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );

    return response.data;
  }

  public async getUserGuild(accessToken: string) {
    const response = await firstValueFrom(
      this.httpService.get(`/users/@me/guilds`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );

    return response.data;
  }
}
