<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Demo catalogue. Image paths point at placeholder artwork shipped with the
 * frontend (/images/products/*.svg). Replace them by uploading real photos
 * from Admin → Products.
 */
class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['Cleansers', 'Gentle washes that lift away the day without stripping.'],
            ['Toners', 'Balancing mists and essences to prep skin.'],
            ['Serums', 'Concentrated treatments for glow, hydration and clarity.'],
            ['Moisturizers', 'Creams and gels that seal in softness.'],
            ['Face Masks', 'Weekly rituals for a reset.'],
            ['Sunscreen', 'Everyday protection that wears beautifully.'],
            ['Body Care', 'Lotions and scrubs for skin from neck to toe.'],
        ];

        $cat = [];
        foreach ($categories as $i => [$name, $desc]) {
            $slug = Str::slug($name);
            $cat[$slug] = Category::query()->updateOrCreate(['slug' => $slug], [
                'name' => $name,
                'description' => $desc,
                'image' => "/images/categories/{$slug}.svg",
                'sort_order' => $i,
                'is_active' => true,
            ]);
        }

        foreach ($this->products() as $i => $p) {
            $slug = Str::slug($p['name']);
            $product = Product::query()->updateOrCreate(['slug' => $slug], [
                'category_id' => $cat[$p['category']]->id,
                'name' => $p['name'],
                'sku' => 'RS-'.str_pad((string) ($i + 101), 4, '0', STR_PAD_LEFT),
                'short_description' => $p['short'],
                'description' => $p['description'],
                'ingredients' => $p['ingredients'],
                'benefits' => $p['benefits'],
                'skin_types' => $p['skin_types'],
                'how_to_use' => $p['how_to_use'],
                'size' => $p['size'],
                'price' => $p['price'],
                'compare_at_price' => $p['compare_at_price'] ?? null,
                'stock' => $p['stock'],
                'low_stock_threshold' => 5,
                'status' => $p['stock'] > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
                'is_featured' => $p['featured'] ?? false,
            ]);

            $product->images()->delete();
            $product->images()->createMany([
                ['path' => "/images/products/{$slug}.svg", 'alt' => $p['name'], 'sort_order' => 0, 'is_primary' => true],
                ['path' => "/images/products/{$slug}-texture.svg", 'alt' => $p['name'].' texture', 'sort_order' => 1, 'is_primary' => false],
            ]);
        }
    }

    private function products(): array
    {
        return [
            [
                'name' => 'Rose Milk Gentle Cleanser', 'category' => 'cleansers', 'price' => 28000, 'stock' => 40, 'size' => '150 ml', 'featured' => true,
                'short' => 'A creamy milk cleanser that melts away sunscreen and leaves skin soft.',
                'description' => 'A low-foam milk cleanser with rose water and oat that removes sunscreen, makeup and the day\'s humidity while keeping the skin barrier comfortable. Suitable for morning and evening.',
                'ingredients' => 'Aqua, Rosa Damascena Flower Water, Glycerin, Avena Sativa (Oat) Kernel Extract, Coco-Glucoside, Squalane, Panthenol, Allantoin, Citric Acid, Phenoxyethanol, Ethylhexylglycerin.',
                'benefits' => ['Cleans without tightness', 'Removes sunscreen', 'Calms redness'],
                'skin_types' => ['Dry', 'Sensitive', 'Normal'],
                'how_to_use' => 'Massage one pump onto damp skin for 30 seconds. Rinse with lukewarm water and pat dry.',
            ],
            [
                'name' => 'Petal Foam Cleanser', 'category' => 'cleansers', 'price' => 24000, 'stock' => 55, 'size' => '120 ml',
                'short' => 'A soft gel-to-foam wash for oily and combination skin.',
                'description' => 'A pH-balanced foaming gel with green tea and a touch of salicylic acid that clears excess oil in hot weather without leaving skin squeaky.',
                'ingredients' => 'Aqua, Sodium Cocoyl Isethionate, Glycerin, Camellia Sinensis Leaf Extract, Salicylic Acid (0.5%), Zinc PCA, Betaine, Rosa Canina Fruit Oil, Sodium Benzoate.',
                'benefits' => ['Controls shine', 'Unclogs pores', 'Fresh finish'],
                'skin_types' => ['Oily', 'Combination'],
                'how_to_use' => 'Lather a pea-sized amount with water, massage over the face and rinse. Use morning and night.',
            ],
            [
                'name' => 'Rosewater Balancing Toner', 'category' => 'toners', 'price' => 26000, 'stock' => 32, 'size' => '200 ml',
                'short' => 'An alcohol-free mist that restores comfort after cleansing.',
                'description' => 'Steam-distilled rose water with hyaluronic acid and a gentle PHA to smooth texture and help serums absorb.',
                'ingredients' => 'Rosa Damascena Flower Water, Glycerin, Gluconolactone, Sodium Hyaluronate, Betaine, Aloe Barbadensis Leaf Juice, Panthenol, Sodium Benzoate.',
                'benefits' => ['Hydrates', 'Refines texture', 'Preps for serum'],
                'skin_types' => ['All skin types'],
                'how_to_use' => 'Mist over the face or sweep on with a cotton pad after cleansing.',
            ],
            [
                'name' => 'Hibiscus Glow Toner', 'category' => 'toners', 'price' => 30000, 'stock' => 4, 'size' => '150 ml',
                'short' => 'A gentle exfoliating essence for brighter, smoother skin.',
                'description' => 'Hibiscus flower acids and lactic acid lift dull surface cells for a lit-from-within look. Use three to four evenings a week.',
                'ingredients' => 'Aqua, Hibiscus Sabdariffa Flower Extract, Lactic Acid (5%), Glycerin, Niacinamide, Sodium Lactate, Allantoin, Phenoxyethanol.',
                'benefits' => ['Brightens', 'Smooths', 'Evens tone'],
                'skin_types' => ['Normal', 'Oily', 'Combination'],
                'how_to_use' => 'In the evening, sweep over clean skin with a cotton pad. Follow with moisturizer and use SPF the next morning.',
            ],
            [
                'name' => 'Vitamin C Brightening Serum', 'category' => 'serums', 'price' => 35000, 'stock' => 60, 'size' => '30 ml', 'featured' => true,
                'short' => 'Stable vitamin C with ferulic acid for a brighter, even complexion.',
                'description' => 'A lightweight serum with 10% ethyl ascorbic acid, a stable form of vitamin C, paired with ferulic acid and vitamin E to fade the look of dark spots and boost radiance.',
                'ingredients' => 'Aqua, Propanediol, 3-O-Ethyl Ascorbic Acid (10%), Glycerin, Ferulic Acid, Tocopherol, Sodium Hyaluronate, Rosa Damascena Flower Water, Xanthan Gum, Phenoxyethanol.',
                'benefits' => ['Fades dark spots', 'Boosts radiance', 'Antioxidant defence'],
                'skin_types' => ['All skin types'],
                'how_to_use' => 'Apply 3–4 drops each morning after toner. Follow with moisturizer and sunscreen.',
            ],
            [
                'name' => 'Hyaluronic Dew Serum', 'category' => 'serums', 'price' => 38000, 'compare_at_price' => 42000, 'stock' => 45, 'size' => '30 ml', 'featured' => true,
                'short' => 'Three weights of hyaluronic acid for plump, bouncy skin.',
                'description' => 'Multi-weight hyaluronic acid with rose extract and panthenol draws in water at every layer of the skin for a dewy, cushioned feel.',
                'ingredients' => 'Aqua, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Glycerin, Panthenol, Rosa Centifolia Flower Extract, Trehalose, Phenoxyethanol.',
                'benefits' => ['Deep hydration', 'Plumps', 'Soothes'],
                'skin_types' => ['Dry', 'Dehydrated', 'Sensitive'],
                'how_to_use' => 'Press 2–3 drops into damp skin morning and night, then seal with moisturizer.',
            ],
            [
                'name' => 'Niacinamide Clarity Serum', 'category' => 'serums', 'price' => 36000, 'stock' => 0, 'size' => '30 ml',
                'short' => '5% niacinamide with zinc to refine pores and calm breakouts.',
                'description' => 'A balancing serum that helps regulate oil, reduces the look of pores and softens post-blemish marks.',
                'ingredients' => 'Aqua, Niacinamide (5%), Zinc PCA, Glycerin, Centella Asiatica Extract, Sodium Hyaluronate, Pentylene Glycol, Phenoxyethanol.',
                'benefits' => ['Refines pores', 'Balances oil', 'Calms blemishes'],
                'skin_types' => ['Oily', 'Combination', 'Acne-prone'],
                'how_to_use' => 'Apply a few drops morning or night before moisturizer.',
            ],
            [
                'name' => 'Peony Barrier Cream', 'category' => 'moisturizers', 'price' => 42000, 'stock' => 28, 'size' => '50 ml', 'featured' => true,
                'short' => 'A rich ceramide cream that repairs and comforts dry skin.',
                'description' => 'Ceramides, shea and peony extract rebuild a stressed barrier and keep skin soft through air-conditioned days.',
                'ingredients' => 'Aqua, Butyrospermum Parkii (Shea) Butter, Glycerin, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Cholesterol, Paeonia Albiflora Root Extract, Squalane, Phenoxyethanol.',
                'benefits' => ['Repairs barrier', 'Long-lasting moisture', 'Softens'],
                'skin_types' => ['Dry', 'Mature', 'Sensitive'],
                'how_to_use' => 'Warm a small amount between fingertips and press onto face and neck as the last step at night.',
            ],
            [
                'name' => 'Cloud Gel Moisturizer', 'category' => 'moisturizers', 'price' => 39000, 'stock' => 36, 'size' => '50 ml',
                'short' => 'A weightless gel-cream that hydrates without shine.',
                'description' => 'Made for humid coastal weather: aloe, squalane and a whisper of rose absorb in seconds and sit well under makeup.',
                'ingredients' => 'Aqua, Aloe Barbadensis Leaf Juice, Glycerin, Squalane, Niacinamide, Sodium Hyaluronate, Carbomer, Rosa Damascena Flower Water, Phenoxyethanol.',
                'benefits' => ['Lightweight', 'Matte-soft finish', 'Hydrates'],
                'skin_types' => ['Oily', 'Combination', 'Normal'],
                'how_to_use' => 'Smooth over face and neck morning and night after serum.',
            ],
            [
                'name' => 'Pink Clay Purifying Mask', 'category' => 'face-masks', 'price' => 32000, 'stock' => 22, 'size' => '75 ml',
                'short' => 'Rose clay draws out impurities while keeping skin soft.',
                'description' => 'A creamy clay mask with kaolin, rose clay and hibiscus that clears congestion in ten minutes without over-drying.',
                'ingredients' => 'Aqua, Kaolin, Illite (Pink Clay), Glycerin, Hibiscus Sabdariffa Flower Extract, Butyrospermum Parkii Butter, Allantoin, Iron Oxides, Phenoxyethanol.',
                'benefits' => ['Deep cleans pores', 'Softens', 'Mattifies'],
                'skin_types' => ['Oily', 'Combination', 'Normal'],
                'how_to_use' => 'Apply an even layer to clean skin, leave for 10 minutes and rinse with warm water. Use 1–2 times a week.',
            ],
            [
                'name' => 'Overnight Rose Sleeping Mask', 'category' => 'face-masks', 'price' => 40000, 'stock' => 18, 'size' => '60 ml', 'featured' => true,
                'short' => 'A cushiony overnight mask for rested, glowing mornings.',
                'description' => 'Rose extract, squalane and peptides work while you sleep so skin wakes up smooth and bright.',
                'ingredients' => 'Aqua, Glycerin, Squalane, Rosa Damascena Flower Extract, Palmitoyl Tripeptide-1, Sodium Hyaluronate, Betaine, Carbomer, Phenoxyethanol.',
                'benefits' => ['Overnight repair', 'Glow', 'Hydration'],
                'skin_types' => ['All skin types'],
                'how_to_use' => 'Apply a generous layer as the final step of your night routine, 2–3 times a week. Rinse in the morning.',
            ],
            [
                'name' => 'Daily Veil SPF 50', 'category' => 'sunscreen', 'price' => 34000, 'stock' => 50, 'size' => '50 ml', 'featured' => true,
                'short' => 'Broad-spectrum SPF 50 with a sheer, rosy finish and no white cast.',
                'description' => 'A fluid sunscreen made for strong equatorial sun. Sheer on all skin tones, wears comfortably in the heat and works under makeup.',
                'ingredients' => 'Aqua, Homosalate, Ethylhexyl Salicylate, Butyl Methoxydibenzoylmethane, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Glycerin, Niacinamide, Tocopherol, Phenoxyethanol.',
                'benefits' => ['SPF 50 protection', 'No white cast', 'Lightweight'],
                'skin_types' => ['All skin types'],
                'how_to_use' => 'Apply two finger-lengths to face and neck as the last morning step. Reapply every 2 hours outdoors.',
            ],
            [
                'name' => 'Silk Body Lotion', 'category' => 'body-care', 'price' => 29000, 'stock' => 3, 'size' => '250 ml',
                'short' => 'A fast-absorbing lotion that leaves skin silky, never sticky.',
                'description' => 'Shea, baobab oil and niacinamide soften rough patches and even out tone on arms and legs.',
                'ingredients' => 'Aqua, Glycerin, Butyrospermum Parkii Butter, Adansonia Digitata (Baobab) Seed Oil, Niacinamide, Cetearyl Alcohol, Dimethicone, Parfum, Phenoxyethanol.',
                'benefits' => ['Softens', 'Evens tone', 'Quick absorbing'],
                'skin_types' => ['All skin types'],
                'how_to_use' => 'Massage into skin after bathing, focusing on dry areas.',
            ],
            [
                'name' => 'Rose Sugar Body Scrub', 'category' => 'body-care', 'price' => 27000, 'stock' => 25, 'size' => '200 g',
                'short' => 'A melting sugar scrub that polishes and nourishes in one step.',
                'description' => 'Fine cane sugar in a rose and coconut oil base buffs away dryness and leaves a light, soft veil on skin.',
                'ingredients' => 'Sucrose, Cocos Nucifera Oil, Rosa Canina Fruit Oil, Butyrospermum Parkii Butter, Tocopherol, Parfum.',
                'benefits' => ['Exfoliates', 'Nourishes', 'Smooths'],
                'skin_types' => ['All skin types'],
                'how_to_use' => 'Massage onto damp skin in circular motions in the shower, then rinse. Use 2–3 times a week.',
            ],
        ];
    }
}
