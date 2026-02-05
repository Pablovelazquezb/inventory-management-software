'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPurchase(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const supplier_name = formData.get('supplier_name') as string
    const note = formData.get('note') as string
    const invoice_url = formData.get('invoice_url') as string
    const status = 'pending' // Default status

    // Parse items from encoded JSON
    const itemsJson = formData.get('items') as string
    if (!itemsJson) return { error: 'No items found' }

    let items = []
    try {
        items = JSON.parse(itemsJson)
    } catch (e) {
        return { error: 'Invalid items data' }
    }

    if (items.length === 0) return { error: 'At least one item is required' }

    // 1. Create Purchase Record
    const { data: purchase, error: purchaseError } = await supabase.from('purchases').insert({
        supplier_name,
        status,
        invoice_url,
        note,
        user_id: user.id
    }).select().single()

    if (purchaseError) return { error: purchaseError.message }

    // 2. Create Purchase Items
    const purchaseItems = items.map((item: any) => ({
        purchase_id: purchase.id,
        item_id: item.item_id,
        quantity: parseFloat(item.quantity),
        price_per_unit: parseFloat(item.price_per_unit),
        unit_type: item.unit_type,
        user_id: user.id
    }))

    const { error: itemsError } = await supabase.from('purchase_items').insert(purchaseItems)

    if (itemsError) {
        // Rollback purchase if items fail (manually, since no transaction block in Supabase client)
        await supabase.from('purchases').delete().eq('id', purchase.id)
        return { error: itemsError.message }
    }

    revalidatePath('/inventory/purchases')
    redirect('/inventory/purchases')
}

export async function completePurchase(purchaseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 1. Get Purchase Items
    const { data: items, error: fetchError } = await supabase
        .from('purchase_items')
        .select('*')
        .eq('purchase_id', purchaseId)

    if (fetchError) return { error: fetchError.message }

    // 2. Update Inventory for each item
    for (const item of items) {
        // Get current stock
        const { data: invItem, error: invError } = await supabase
            .from('inventory_items')
            .select('quantity')
            .eq('id', item.item_id)
            .single()

        if (invError) {
            console.error(`Failed to find inventory item ${item.item_id}`)
            continue
        }

        // Update quantity
        // Note: unit_type mismatch handling is up to user discretion for now.
        // We assume user knows what they are buying.
        await supabase
            .from('inventory_items')
            .update({ quantity: (invItem.quantity || 0) + item.quantity })
            .eq('id', item.item_id)

        // Log stock entry
        await supabase.from('stock_entries').insert({
            item_id: item.item_id,
            quantity_added: item.quantity,
            user_id: user.id,
            note: `Purchase #${purchaseId.slice(0, 8)} Completed`,
            // document_url: ??? we could link to purchase
        })
    }

    // 3. Update Purchase Status
    const { error: updateError } = await supabase
        .from('purchases')
        .update({ status: 'completed' })
        .eq('id', purchaseId)

    if (updateError) return { error: updateError.message }

    revalidatePath('/inventory/purchases')
    revalidatePath(`/inventory/purchases/${purchaseId}`)
}

export async function deletePurchase(purchaseId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('purchases').delete().eq('id', purchaseId)

    if (error) throw new Error(error.message)
    revalidatePath('/inventory/purchases')
}
