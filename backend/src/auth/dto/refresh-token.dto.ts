import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Токен обновления, полученный при входе или регистрации',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
