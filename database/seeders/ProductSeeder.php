<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if we already have products to avoid duplicates
        if (Product::count() > 0) {
            $this->command->info('Products already exist. Skipping product seeding.');
            return;
        }

        // Get some category IDs to associate products with
        $categoryIds = Category::pluck('id')->toArray();

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
            ],
            [
                'category_id' => $categoryIds[3] ?? $categoryIds[0],
                'name' => 'Matcha Green Tea',
                'description' => 'Premium Japanese matcha green tea powder.',
                'price' => 22.99,
                'stock_quantity' => 25,
                'is_available' => true,
                'brewing_method' => 'Whisk',
                'recommended_water_temp' => 80.0,
                'recommended_brew_time' => 1,
                'coffee_to_water_ratio' => '1:100',
                'grind_size' => 'Powder',
                'recipe_instructions' => [
                    '1. Sift 1-2 tsp matcha powder into bowl to remove clumps',
                    '2. Add 2oz hot water (not boiling)',
                    '3. Whisk vigorously in W motion until frothy',
                    '4. Add more water or milk to taste'
                ]
            ],
            [
                'category_id' => $categoryIds[4] ?? $categoryIds[0],
                'name' => 'California Roll',
                'description' => 'Classic sushi roll with crab, avocado, and cucumber.',
                'price' => 8.99,
                'stock_quantity' => 40,
                'is_available' => true,
                'brewing_method' => 'Roll',
                'recommended_water_temp' => null,
                'recommended_brew_time' => null,
                'coffee_to_water_ratio' => null,
                'grind_size' => null,
                'recipe_instructions' => [
                    '1. Prepare sushi rice and let cool slightly',
                    '2. Place nori sheet on bamboo mat, shiny side down',
                    '3. Spread rice evenly over nori, leaving 1-inch border at top',
                    '4. Add fillings: crab sticks, avocado slices, cucumber strips',
                    '5. Roll tightly using bamboo mat, seal with water',
                    '6. Slice into 6. Slice into 6-8 pieces and serve with soy sauce and wasabi'
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
