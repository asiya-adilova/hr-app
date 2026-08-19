import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccountResponseDto, AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { Auth } from './decorators/auth.decorator';
import { toApiResponse } from '../common/response/service-result-mapper';
import { ApiDataResponse } from '../common/swagger/api-data-response';

@ApiTags('Security')
@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Регистрация аккаунта сотрудника' })
  @ApiBody({ type: RegisterDto })
  @ApiDataResponse(AuthResponseDto)
  async register(@Body() dto: RegisterDto) {
    return toApiResponse(await this.securityService.register(dto));
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({ type: LoginDto })
  @ApiDataResponse(AuthResponseDto)
  async login(@Body() dto: LoginDto) {
    return toApiResponse(await this.securityService.login(dto));
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Обновить access и refresh токены' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiDataResponse(AuthResponseDto)
  async refresh(@Body() dto: RefreshTokenDto) {
    return toApiResponse(await this.securityService.refresh(dto));
  }

  @Auth()
  @Get('me')
  @ApiOperation({ summary: 'Текущий аккаунт' })
  @ApiDataResponse(AccountResponseDto)
  async me() {
    return toApiResponse(await this.securityService.me());
  }
}
