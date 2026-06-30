import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDiscussionMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string;
}
