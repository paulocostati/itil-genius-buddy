
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ywdhaicivsufharivwdv.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_W1xhSAqhd_GYz_EJ25dssQ_VyMSZdWT';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking Products...");
    const { data: products, error: prodError } = await supabase.from('products').select('*');

    if (prodError) {
        console.error("Error fetching products:", prodError);
    } else {
        console.log(`Found ${products.length} products.`);
        if (products.length > 0) {
            console.log(products[0]);
        }
    }

    console.log("\nChecking Categories...");
    const { data: categories, error: catError } = await supabase.from('categories').select('*');

    if (catError) {
        console.error("Error fetching categories:", catError);
    } else {
        console.log(`Found ${categories.length} categories.`);
    }
}

checkData();
