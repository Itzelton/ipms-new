import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { RoleName } from '@prisma/client';

export class CreateInviteDto {
  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  expiresInDays?: number;
}
