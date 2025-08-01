import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filesToUpdate = [
  'src/views/retailer/RetailerView.vue',
  'src/views/retailer/AddRetailerProductView.vue',
  'src/views/product/ProductsView.vue',
  'src/components/header/HeaderProductMenu.vue',
  'src/components/home/categories/CategoryItem.vue'
];

for (const filePath of filesToUpdate) {
  const fullPath = join(__dirname, filePath);
  try {
    let content = readFileSync(fullPath, 'utf8');
    
    // Update the import path
    content = content.replace(
      /from ['"]@\/ts\/models\/category.types(?:.js)?['"]/g,
      'from "@/types/category"'
    );
    
    writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated imports in ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

console.log('Import updates complete!');
