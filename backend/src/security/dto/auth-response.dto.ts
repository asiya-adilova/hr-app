import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

export class AccountResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin@hr.local' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role!: Role;

  @ApiProperty({ example: 'Админ' })
  firstName!: string;

  @ApiProperty({ example: 'Системы' })
  lastName!: string;

  @ApiPropertyOptional({ example: 'Иванович' })
  middleName?: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({
    example: '15m',
    description: 'Срок действия access-токена',
  })
  expiresIn!: string;

  @ApiProperty({ type: AccountResponseDto })
  account!: AccountResponseDto;
}
