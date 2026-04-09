import { IsBoolean } from 'class-validator';

export class UpdateModuleToggleDto {
  @IsBoolean()
  enabled!: boolean;
}

