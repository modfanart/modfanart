import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { BrandsService } from 'src/modules/brands/brands.service';
@Injectable()
export class BrandAccessGuard implements CanActivate {
  constructor(private brandsService: BrandsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const brandId = req.params.brandId || req.params.id;
    const userId = req.user?.id;

    if (!brandId || !userId) throw new ForbiddenException('Access denied');

    const hasAccess = await this.brandsService.hasBrandAccess(brandId, userId, [
      'owner',
      'manager',
      'editor',
    ]);
    if (!hasAccess)
      throw new ForbiddenException('Insufficient brand permissions');

    return true;
  }
}
