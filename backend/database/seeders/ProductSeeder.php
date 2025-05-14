<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductSize;
use App\Models\Stock;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Smartphone X',
                'description' => 'Latest smartphone with advanced features',
                'price' => 599.99,
                'image' => 'smartphone.jpg',
                'images' => ['smartphone-1.jpg', 'smartphone-2.jpg'],
                'category' => 'Electronics',
                'is_best_seller' => true,
                'sizes' => [
                    ['size' => 'small', 'stock' => 5],
                    ['size' => 'medium', 'stock' => 10],
                    ['size' => 'large', 'stock' => 8]
                ]
            ],
            [
                'name' => 'Laptop Pro',
                'description' => 'High-performance laptop for professionals',
                'price' => 1299.99,
                'image' => 'laptop.jpg',
                'category' => 'Electronics',
                'is_best_seller' => true,
                'sizes' => [
                    ['size' => 'small', 'stock' => 3],
                    ['size' => 'medium', 'stock' => 7]
                ]
            ],
            [
                'name' => 'Wireless Headphones',
                'description' => 'Noise-cancelling wireless headphones',
                'price' => 199.99,
                'image' => 'headphones.jpg',
                'category' => 'Electronics',
                'is_best_seller' => false,
                'sizes' => [
                    ['size' => 'medium', 'stock' => 15],
                    ['size' => 'large', 'stock' => 10]
                ]
            ],
            [
                'name' => 'Smart Watch',
                'description' => 'Fitness and health tracking smartwatch',
                'price' => 249.99,
                'image' => 'smartwatch.jpg',
                'category' => 'Electronics',
                'is_best_seller' => false,
                'sizes' => [
                    ['size' => 'small', 'stock' => 8],
                    ['size' => 'medium', 'stock' => 7]
                ]
            ],
            [
                'name' => 'Coffee Maker',
                'description' => 'Automatic coffee maker with timer',
                'price' => 89.99,
                'image' => 'coffeemaker.jpg',
                'category' => 'Home Appliances',
                'is_best_seller' => true,
                'sizes' => [
                    ['size' => 'medium', 'stock' => 12],
                    ['size' => 'large', 'stock' => 8]
                ]
            ],
        ];

        foreach ($products as $productData) {
            $sizes = $productData['sizes'];
            unset($productData['sizes']);
            
            $product = Product::create($productData);
            
            // Create stock record
            Stock::create([
                'product_id' => $product->id,
                'quantity' => collect($sizes)->sum('stock'),
                'min_quantity' => 5
            ]);
            
            // Create size records
            foreach ($sizes as $sizeData) {
                ProductSize::create([
                    'product_id' => $product->id,
                    'size' => $sizeData['size'],
                    'stock' => $sizeData['stock']
                ]);
            }
        }
    }
}
