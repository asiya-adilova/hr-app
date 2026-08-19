import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const PASSWORD_REQUIREMENTS_MESSAGE =
  'Пароль должен содержать минимум 8 символов, включая буквы, цифры и спецсимволы';

export class LoginDto {
  @ApiProperty({
    example: 'admin@hr.local',
    description: 'Электронная почта аккаунта',
  })
  @IsEmail({}, { message: 'Укажите корректный email' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'Admin123!',
    description: PASSWORD_REQUIREMENTS_MESSAGE,
    minLength: 8,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_PATTERN, {
    message: PASSWORD_REQUIREMENTS_MESSAGE,
  })
  password!: string;
}

export class RegisterDto extends LoginDto {
  @ApiProperty({
    example: 'Алишер',
    description: 'Имя',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({
    example: 'Каримов',
    description: 'Фамилия',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({
    example: 'Рустамович',
    description: 'Отчество',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  middleName?: string;
}
