import { IsOptional, IsString } from 'class-validator';

export class UpdateDiscussionThreadDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
