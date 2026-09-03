import { IsInt, Max, Min } from 'class-validator';

export class UpdateCollaboratorLimitDto {
  @IsInt()
  @Min(0)
  @Max(50)
  collaboratorLimit!: number;
}
