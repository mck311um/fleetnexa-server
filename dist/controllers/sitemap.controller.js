"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_config_1 = __importDefault(require("../config/prisma.config"));
const slugify_1 = __importDefault(require("slugify"));
function makeSlug(name) {
    return (0, slugify_1.default)(name, { lower: true, strict: true });
}
const getSitemap = async (req, res, next) => {
    console.log('Generating sitemap...');
    try {
        const tenants = await prisma_config_1.default.tenant.findMany({
            where: { storefrontEnabled: true },
            select: {
                tenantName: true,
                updatedAt: true,
            },
        });
        const caribbeanCountries = await prisma_config_1.default.caribbeanCountry.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getSitemap,
};
