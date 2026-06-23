import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Please sign in first.' }, { status: 401 });

  const admin = createAdminClient();

  // Block if another admin already exists
  const { data: existingAdmins } = await admin
    .from('profiles')
    .select('id, email')
    .eq('role', 'admin');

  const otherAdmin = (existingAdmins ?? []).find(a => a.id !== user.id);
  if (otherAdmin) {
    return Response.json({
      error: `Setup already done. Admin exists: ${otherAdmin.email}. Go to /admin to log in as admin.`,
    }, { status: 400 });
  }

  // Promote current user to admin
  await admin.from('profiles').update({ role: 'admin' }).eq('id', user.id);

  // Create or approve a demo seller using current user
  const { data: existingSeller } = await admin
    .from('sellers').select('id, status').eq('id', user.id).single();

  if (!existingSeller) {
    await admin.from('sellers').insert({
      id: user.id,
      shop_name: 'Mazel Demo Store',
      shop_address: 'Chennai, Tamil Nadu',
      gst_number: null,
      status: 'approved',
    });
  } else if (existingSeller.status !== 'approved') {
    await admin.from('sellers').update({ status: 'approved' }).eq('id', user.id);
  }

  // Get category IDs
  const { data: cats } = await admin.from('categories').select('id, slug');
  const catMap = Object.fromEntries((cats ?? []).map(c => [c.slug, c.id]));

  // Insert 2 demo products only if none exist for this seller
  const { data: existing } = await admin
    .from('products').select('id').eq('seller_id', user.id).limit(1);

  if (!existing || existing.length === 0) {
    await admin.from('products').insert([
      {
        seller_id: user.id,
        name: 'Organic Turmeric Powder',
        description: 'Pure organic turmeric powder from Tamil Nadu farms. Rich in curcumin — great for cooking and health. 100g pack.',
        price: 299,
        stock: 50,
        category_id: catMap['groceries'] ?? null,
        images: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400'],
        status: 'active',
      },
      {
        seller_id: user.id,
        name: 'Handwoven Cotton Kurta',
        description: 'Handcrafted cotton kurta with traditional block-print embroidery. Comfortable and elegant. Available in S/M/L/XL.',
        price: 899,
        stock: 25,
        category_id: catMap['handmade'] ?? null,
        images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400'],
        status: 'active',
      },
    ]);
  }

  return Response.json({
    success: true,
    message: 'Setup complete! You are now admin. A demo seller shop and 2 products have been added.',
  });
}
