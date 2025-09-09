import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma.config';
import slugify from 'slugify';

function makeSlug(name: string) {
  return slugify(name, { lower: true, strict: true });
}

const getSitemap = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Generating sitemap...');

  try {
    const tenants = await prisma.tenant.findMany({
      where: { storefrontEnabled: true },
      select: {
        tenantName: true,
        updatedAt: true,
      },
    });

    const caribbeanCountries = await prisma.caribbeanCountry.findMany({
      where: { isActive: true },
      include: { country: true },
    });

    const tenantSlugs = tenants.map((t) => ({
      slug: makeSlug(t.tenantName),
      lastModified: t.updatedAt ?? undefined,
    }));

    const destinationSlugs = caribbeanCountries.map((c) => ({
      slug: makeSlug(c.country.country),
      lastModified: Date.now(),
    }));

    const staticPages = [
      { slug: '', lastModified: undefined },
      { slug: 'about', lastModified: undefined },
      { slug: 'contact', lastModified: undefined },
      { slug: 'companies', lastModified: undefined },
      { slug: 'destinations', lastModified: undefined },
      { slug: 'privacy', lastModified: undefined },
      { slug: 'terms', lastModified: undefined },
    ];

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    return res.json({
      staticPages,
      tenants: tenantSlugs,
      destinations: destinationSlugs,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getSitemap,
};
