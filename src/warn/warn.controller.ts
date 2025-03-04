import { Controller } from '@nestjs/common';
import { WarnService } from './warn.service';

@Controller('warn')
export class WarnController {
  constructor(private readonly warnService: WarnService) {}
}
