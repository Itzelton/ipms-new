import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignSupervisorDto {
  @IsNotEmpty()
  @IsUUID()
  supervisorId: string;
}
