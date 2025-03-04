import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscordService } from 'src/discord/discord.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly discordService: DiscordService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  public async getLoginUrl() {
    const redirectUri = this.configService.get('DISCORD_REDIRECT_URI');
    const clientId = this.configService.get('DISCORD_CLIENT_ID');
    const scopes = ['guilds', 'identify'];
    const url = new URL(
      'https://discord.com/oauth2/authorize?redirect="https://naver.com"',
    );

    url.searchParams.set('client_id', clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', scopes.join(' '));

    return url.toString();
  }

  public async login(code: string) {
    const accessToken = await this.discordService.getAccessToken(code);
    const identity = await this.discordService.getIdentity(accessToken);
    const userGuilds = await this.discordService.getUserGuild(accessToken);

    const guild = userGuilds.find(
      (guild) => guild.id === this.configService.get('DISCORD_GUILD_ID'),
    );
    if (!guild)
      throw new ForbiddenException('디벤치 서버에 먼저 가입해주세요.');

    return {
      accessToken: this.jwtService.sign({
        sub: identity.user.id,
      }),
    };
  }

  public async validateUserById(sub: string) {
    return await this.userService.getUserById(sub);
  }
}
