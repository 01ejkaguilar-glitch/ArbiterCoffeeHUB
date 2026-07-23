<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SampleProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if we already have products to avoid duplicates
        if (Product::count() > 0) {
            $this->command->info('Products already exist. Skipping sample product seeding.');
            return;
        }

        // Get some category IDs to associate products with
        $categoryIds = \App\Models\Category::pluck('id')->toArray();
        
        if (empty($categoryIds)) {
            $this->command->error('No categories found. Please run category seeders first.');
            return;
        }

        // Sample products data
        $sampleProducts = [
            [
                'category_id' => $categoryIds[0],
                'name' => 'Ethiopian Yirgacheffe',
                'description' => 'A light-bodied coffee with floral notes and bright acidity.',
                'price' => 18.99,
                'stock_quantity' => 50,
                'is_available' => true,
                'brewing_method' => 'Pour Over',
                'recommended_water_temp' => 92.0,
                'recommended_brew_time' => 3,
                'coffee_to_water_ratio' => '1:16',
                'grind_size' => 'Medium-Fine',
                'recipe_instructions' => [
                    '1. Grind 20g of coffee to medium-fine consistency',
                    '2. Place filter in dripper and rinse with hot water',
                    '3. Add ground coffee and bloom with 40ml water for 30 seconds',
                    '4. Pour water in circular motions until reaching 320g total',
                    '5. Let drain completely and serve'
                ]
            ],
            [
                'category_id' => $categoryIds[1] ?? $categoryIds[0],
                'name' => 'Caramel Macchiato',
                'description' => 'Espresso with steamed milk, vanilla syrup, and caramel drizzle.',
                'price' => 5.99,
                'stock_quantity' => 100,
                'is_available' => true,
                'brewing_method' => 'Espresso Machine',
                'recommended_water_temp' => 93.0,
                'recommended_brew_time' => 25,
                'coffee_to_water_ratio' => '1:2',
                'grind_size' => 'Fine',
                'recipe_instructions' => [
                    '1. Pull a double shot of espresso (60ml)',
                    '2. Steam 180ml of milk with vanilla syrup',
                    '3. Pour milk over espresso, holding back foam',
                    '4. Top with remaining foam and drizzle with caramel'
                ]
            ],
            [
                'category_id' => $categoryIds[2] ?? $categoryIds[0],
                'name' => 'Teriyaki Chicken Bowl',
                'description' => 'Grilled chicken thigh with teriyaki sauce over steamed rice.',
                'price' => 12.50,
                'stock_quantity' => 30,
                'is_available' => true,
                'brewing_method' => 'Grill',
                'recommended_water_temp' => null,
                'recommended_brew_time' => null,
                'coffee_to_water_ratio' => null,
                'grind_size' => null,
                'recipe_instructions' => [
                    '1. Marinate chicken thigh in teriyaki sauce for 30 minutes',
                    '2. Grill chicken until cooked through and caramelized',
                    '3. Serve over steamed rice with extra teriyaki sauce',
                    '4. Garnish with sesame seeds and green onions'
                ]
            ]
        ];

        // Create products
        $createdCount = 0;
        foreach ($sampleProducts as $productData) {
            try {
                Product::create($productData);
                $createdCount++;
            } catch (\Exception $e) {
                $this->command->error("Failed to create product {$productData['name']}: " . $e->getMessage());
            }
        }

        $this->command->info("Successfully created {$createdCount} sample products.");
    }
}
