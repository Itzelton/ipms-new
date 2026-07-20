import { IsOptional, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
