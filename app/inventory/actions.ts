'use server'

import { createClient } from '@/utils/supabase/server'
import { getCurrentOrgId } from '@/utils/supabase/organization'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createItem(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'You must be logged in to create items' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const subcategoryId = formData.get('subcategory_id') as string || null
    const quantity = parseFloat(formData.get('quantity') as string)
    const price = parseFloat(formData.get('price') as string)
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const unitType = formData.get('unit_type') as string || 'unit'
    const description = formData.get('description') as string

    const { data: item, error: itemError } = await supabase.from('inventory_items').insert({
        name,
        category,
        subcategory_id: subcategoryId,
        quantity,
        price,
        weight,
        unit_type: unitType,
        description,
        user_id: user.id,
        organization_id: orgId
    }).select().single()

    if (itemError) return { error: itemError.message }

    // Record initial stock entry
    await supabase.from('stock_entries').insert({
        item_id: item.id,
        quantity_added: quantity,
        user_id: user.id,
        organization_id: orgId
    })

    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    redirect('/inventory')
}

export async function deleteItem(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('inventory_items').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/inventory')
    revalidatePath('/dashboard')
}

export async function sellItem(id: string, quantitySold: number, note?: string, invoice_url?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    if (quantitySold <= 0) return { error: 'Quantity must be greater than zero' }

    // Get item
    const { data: item, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single()

    if (fetchError || !item) return { error: 'Item not found' }
    if (item.quantity < quantitySold) {
        return { error: `Insufficient stock. You only have ${item.quantity} units available.` }
    }

    // Decrement stock
    const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: item.quantity - quantitySold })
        .eq('id', id)

    if (updateError) return { error: 'Failed to update stock' }

    // Record sale
    const { error: saleError } = await supabase.from('sales').insert({
        item_id: id,
        item_name: item.name,
        quantity: quantitySold,
        price_per_unit: item.price,
        total_price: item.price * quantitySold,
        user_id: user.id,
        organization_id: orgId,
        note,
        invoice_url
    })

    if (saleError) console.error('Error recording sale:', saleError)

    revalidatePath('/inventory')
    revalidatePath('/dashboard')
}

export async function restockItem(id: string, quantityAdded: number, note?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    if (quantityAdded <= 0) return { error: 'Quantity must be greater than zero' }

    // Get item
    const { data: item, error: fetchError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single()

    if (fetchError || !item) return { error: 'Item not found' }

    // Increment stock
    const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: item.quantity + quantityAdded })
        .eq('id', id)

    if (updateError) return { error: 'Failed to update stock' }

    // Record entry
    await supabase.from('stock_entries').insert({
        item_id: id,
        quantity_added: quantityAdded,
        user_id: user.id,
        organization_id: orgId,
        note
    })

    revalidatePath('/inventory')
    revalidatePath('/dashboard')
}

export async function createSubcategory(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'You must be logged in to create subcategories' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    const name = formData.get('name') as string
    const categoryId = formData.get('category_id') as string

    if (!name || name.trim() === '') return { error: 'Subcategory name is required' }
    if (!categoryId) return { error: 'Category ID is required' }

    const { error } = await supabase.from('subcategories').insert({
        name,
        category_id: categoryId,
        user_id: user.id,
        organization_id: orgId
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/inventory/categories')
    revalidatePath('/inventory/add')
}

export async function deleteSubcategory(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('subcategories').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/inventory/categories')
    revalidatePath('/inventory/add')
}

export async function createCategory(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'You must be logged in to create categories' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    const name = formData.get('name') as string
    if (!name || name.trim() === '') return { error: 'Category name is required' }

    const { error } = await supabase.from('categories').insert({
        name,
        user_id: user.id,
        organization_id: orgId
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/inventory/categories')
    revalidatePath('/inventory/add')
}

export async function deleteCategory(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }


    revalidatePath('/inventory/categories')
    revalidatePath('/inventory/add')
}

export async function splitItem(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to split items' }
    }

    const { data: item, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single()

    if (fetchError || !item) {
        return { error: 'Item not found' }
    }

    if (item.quantity <= 1) {
        return { error: 'Cannot split an item with quantity 1' }
    }

    const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: item.quantity - 1 })
        .eq('id', id)

    if (updateError) {
        return { error: 'Failed to update original item' }
    }

    const { error: insertError } = await supabase
        .from('inventory_items')
        .insert({
            name: item.name,
            category: item.category,
            subcategory_id: item.subcategory_id,
            description: item.description,
            price: item.price,
            weight: item.weight,
            quantity: 1,
            user_id: user.id
        })

    if (insertError) {
        console.error('Failed to create split item', insertError)
        return { error: 'Failed to create new unit' }
    }

    revalidatePath('/inventory')
}

export async function updateItem(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to update items' }
    }

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const subcategoryId = formData.get('subcategory_id') as string || null
    const quantity = parseFloat(formData.get('quantity') as string)
    const price = parseFloat(formData.get('price') as string)
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const description = formData.get('description') as string
    const image_url = formData.get('image_url') as string

    const { error } = await supabase.from('inventory_items').update({
        name,
        category,
        subcategory_id: subcategoryId,
        quantity,
        price,
        weight,
        description,
        image_url: image_url || null
    }).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/inventory')
    revalidatePath(`/inventory/edit/${id}`)
    redirect('/inventory')
}

export async function updateCategory(id: string, name: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('categories').update({ name }).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/inventory/categories')
    revalidatePath('/inventory/add')
}

export async function updateSubcategory(id: string, name: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('subcategories').update({ name }).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/inventory/categories')
    revalidatePath('/inventory/add')
}

export async function createBatchItems(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    const category = formData.get('category') as string
    const subcategoryId = formData.get('subcategory_id') as string || null
    const price = parseFloat(formData.get('price') as string)
    const unitType = formData.get('unit_type') as string || 'unit'
    const description = formData.get('description') as string

    // Parse variants
    const variantsJson = formData.get('variants') as string
    let variants: any[] = []
    try {
        variants = JSON.parse(variantsJson)
    } catch (e) {
        return { error: 'Invalid variants data' }
    }

    if (!variants || variants.length === 0) return { error: 'No variants provided' }

    const itemsToInsert = variants.map(v => {
        let sku = v.id && v.id.trim() !== '' ? v.id.trim() : null
        if (!sku) {
            sku = `ITEM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        }

        return {
            name: v.name,
            category,
            subcategory_id: subcategoryId,
            quantity: parseFloat(v.quantity) || 1,
            price: v.price ? parseFloat(v.price) : price,
            sku: sku,
            weight: v.weight ? parseFloat(v.weight) : null,
            unit_type: unitType,
            description,
            image_url: v.image_url || null,
            user_id: user.id,
            organization_id: orgId
        }
    })

    const { data: insertedItems, error: insertError } = await supabase
        .from('inventory_items')
        .insert(itemsToInsert)
        .select()

    if (insertError) return { error: insertError.message }

    // Log stock entries
    const entries = insertedItems.map(item => ({
        item_id: item.id,
        quantity_added: item.quantity,
        user_id: user.id,
        note: 'Batch Creation'
    }))

    const { error: entryError } = await supabase.from('stock_entries').insert(entries)

    if (entryError) console.error('Error creating stock entries for batch', entryError)

    revalidatePath('/inventory')
    revalidatePath('/dashboard')
    redirect('/inventory')
}

// Batch sell items (Shopping Cart style)
export async function sellBatchItems(
    cartItems: { id: string; quantity: number; price: number }[],
    note?: string,
    invoice_url?: string,
    customerId?: string,
    taxes: any[] = []
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    if (!cartItems || cartItems.length === 0) return { error: 'No items in cart' }

    // Validate all items first
    for (const cartItem of cartItems) {
        if (cartItem.quantity <= 0) return { error: `Invalid quantity for item ID ${cartItem.id}` }
    }

    // Process each item
    const errors = []
    const successfulSales = []

    // 1. Verify Stock
    const itemIds = cartItems.map(c => c.id)
    const { data: dbItems, error: fetchError } = await supabase
        .from('inventory_items')
        .select('id, quantity, name')
        .in('id', itemIds)

    if (fetchError || !dbItems) return { error: 'Failed to fetch item details' }

    const dbItemMap = new Map(dbItems.map(i => [i.id, i]))

    for (const cartItem of cartItems) {
        const dbItem = dbItemMap.get(cartItem.id)
        if (!dbItem) return { error: `Item not found: ${cartItem.id}` }
        if (dbItem.quantity < cartItem.quantity) {
            return { error: `Insufficient stock for ${dbItem.name}. Available: ${dbItem.quantity}` }
        }
    }

    // 2. Execute Updates and Inserts
    for (const cartItem of cartItems) {
        const dbItem = dbItemMap.get(cartItem.id)!

        // Deduct Stock
        const { error: updateError } = await supabase
            .from('inventory_items')
            .update({ quantity: dbItem.quantity - cartItem.quantity })
            .eq('id', cartItem.id)

        if (updateError) {
            console.error(`Failed to update stock for ${dbItem.name}:`, updateError)
            errors.push(`Failed to update ${dbItem.name}`)
            continue
        }

        // Record Sale
        const { error: saleError } = await supabase.from('sales').insert({
            item_id: cartItem.id,
            item_name: dbItem.name,
            quantity: cartItem.quantity,
            price_per_unit: cartItem.price,
            total_price: cartItem.price * cartItem.quantity,
            user_id: user.id,
            organization_id: orgId,
            note,
            invoice_url,
            customer_id: customerId || null,
            taxes: JSON.stringify(taxes),
            tax_rate: taxes.reduce((sum, t) => sum + (t.rate || 0), 0),
            tax_amount: (cartItem.price * cartItem.quantity) * taxes.reduce((sum, t) => sum + (t.rate || 0), 0)
        })

        if (saleError) {
            console.error(`Failed to record sale for ${dbItem.name}:`, saleError)
        } else {
            successfulSales.push(dbItem.name)
        }
    }

    revalidatePath('/inventory')
    revalidatePath('/dashboard')

    if (errors.length > 0) {
        return { error: `Completed with errors: ${errors.join(', ')}` }
    }

    return { success: true }
}
// SUPPLIERS ACTIONS

export async function createSupplier(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    const name = formData.get('name') as string
    const contactInfo = formData.get('contact_info') as string
    const rfc = formData.get('rfc') as string
    const address = formData.get('address') as string
    const legalName = formData.get('legal_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const notes = formData.get('notes') as string

    if (!name || name.trim() === '') return { error: 'Supplier name is required' }

    const { error } = await supabase.from('suppliers').insert({
        name,
        contact_info: contactInfo,
        rfc,
        address,
        legal_name: legalName,
        email,
        phone,
        notes,
        organization_id: orgId
    })

    if (error) return { error: error.message }

    revalidatePath('/inventory/suppliers')
    return { success: true }
}

export async function updateSupplier(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const contactInfo = formData.get('contact_info') as string
    const rfc = formData.get('rfc') as string
    const address = formData.get('address') as string
    const legalName = formData.get('legal_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const notes = formData.get('notes') as string

    if (!name || name.trim() === '') return { error: 'Supplier name is required' }

    const { error } = await supabase.from('suppliers').update({
        name,
        contact_info: contactInfo,
        rfc,
        address,
        legal_name: legalName,
        email,
        phone,
        notes,
        updated_at: new Date().toISOString()
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/inventory/suppliers')
    return { success: true }
}

export async function deleteSupplier(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/inventory/suppliers')
}

// PURCHASES ACTIONS

export async function createPurchase(
    supplierId: string,
    items: { itemId: string; quantity: number; cost: number }[],
    totalAmount: number,
    expectedDate?: string,
    documentUrl?: string,
    taxRate: number = 0,
    paymentStatus: string = 'pending',
    notes: string = '',
    taxes: any[] = []
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    if (!supplierId) return { error: 'Supplier is required' }
    if (!items || items.length === 0) return { error: 'No items in purchase order' }

    // 1. Create Purchase Record
    const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
            supplier_id: supplierId,
            total_amount: totalAmount,
            expected_date: expectedDate || null,
            document_url: documentUrl || null,
            status: 'ordered',
            tax_rate: taxRate,
            payment_status: paymentStatus,
            notes: notes,
            taxes: JSON.stringify(taxes),
            organization_id: orgId
        })
        .select()
        .single()

    if (purchaseError) return { error: purchaseError.message }

    // 2. Create Purchase Items
    const purchaseItems = items.map(item => ({
        purchase_id: purchase.id,
        item_id: item.itemId,
        quantity_ordered: item.quantity,
        cost_per_unit: item.cost,
        quantity_received: 0,
        organization_id: orgId
    }))

    const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems)

    if (itemsError) {
        // compensate? delete purchase? for now just return error
        console.error('Error creating purchase items', itemsError)
        return { error: 'Failed to save purchase items' }
    }

    revalidatePath('/inventory/purchases')
    return { success: true, id: purchase.id }
}

export async function updatePurchasePaymentStatus(id: string, status: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('purchases')
        .update({ payment_status: status })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath(`/inventory/purchases/${id}`)
    revalidatePath('/inventory/purchases')
    return { success: true }
}


export async function receivePurchaseItems(
    purchaseId: string,
    items: { id: string; itemId: string; quantityReceived: number }[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 1. Update Purchase Status
    const { error: statusError } = await supabase
        .from('purchases')
        .update({ status: 'received' })
        .eq('id', purchaseId)

    if (statusError) return { error: 'Failed to update purchase status' }

    // 2. Update Items and Inventory
    for (const item of items) {
        // Update purchase_items
        await supabase
            .from('purchase_items')
            .update({ quantity_received: item.quantityReceived })
            .eq('id', item.id)

        // Increment Inventory
        const { data: invItem } = await supabase
            .from('inventory_items')
            .select('quantity')
            .eq('id', item.itemId)
            .single()

        if (invItem) {
            await supabase
                .from('inventory_items')
                .update({ quantity: invItem.quantity + item.quantityReceived })
                .eq('id', item.itemId)

            // Log stock entry
            await supabase.from('stock_entries').insert({
                item_id: item.itemId,
                quantity_added: item.quantityReceived,
                user_id: user.id,
                note: `Purchase Order Received` // Could add PO ID here
            })
        }
    }

    revalidatePath('/inventory/purchases')
    revalidatePath('/inventory')
    return { success: true }
}

// CATALOG ACTIONS

export async function createCatalogItem(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    let orgId: string
    try { orgId = await getCurrentOrgId() } catch { return { error: 'No active organization' } }

    const supplierId = formData.get('supplier_id') as string
    const name = formData.get('name') as string
    const supplierSku = formData.get('supplier_sku') as string
    const cost = parseFloat(formData.get('cost') as string)
    const description = formData.get('description') as string
    const imageUrl = formData.get('image_url') as string

    if (!supplierId || !name) return { error: 'Supplier and Name are required' }

    const { error } = await supabase.from('supplier_products').insert({
        supplier_id: supplierId,
        name,
        supplier_sku: supplierSku || null,
        cost: isNaN(cost) ? null : cost,
        description: description || null,
        image_url: imageUrl || null,
        organization_id: orgId
    })

    if (error) return { error: error.message }
    revalidatePath(`/inventory/suppliers/${supplierId}`)
    revalidatePath('/inventory/catalog')
    return { success: true }
}

export async function updateCatalogItem(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const supplierSku = formData.get('supplier_sku') as string
    const cost = parseFloat(formData.get('cost') as string)
    const description = formData.get('description') as string
    const imageUrl = formData.get('image_url') as string

    const { error } = await supabase.from('supplier_products').update({
        name,
        supplier_sku: supplierSku || null,
        cost: isNaN(cost) ? null : cost,
        description: description || null,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString()
    }).eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/inventory/catalog')
    return { success: true }
}

export async function deleteCatalogItem(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('supplier_products').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/inventory/catalog')
}



// CUSTOMER ACTIONS

export async function createCustomer(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const rfc = formData.get('rfc') as string
    const address = formData.get('address') as string
    const legalName = formData.get('legal_name') as string
    const notes = formData.get('notes') as string

    if (!name || name.trim() === '') return { error: 'Customer name is required' }

    const { error } = await supabase.from('customers').insert({
        name,
        email,
        phone,
        rfc,
        address,
        legal_name: legalName,
        notes
    })

    if (error) return { error: error.message }

    revalidatePath('/inventory/customers')
    return { success: true }
}

export async function updateCustomer(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const rfc = formData.get('rfc') as string
    const address = formData.get('address') as string
    const legalName = formData.get('legal_name') as string
    const notes = formData.get('notes') as string

    if (!name || name.trim() === '') return { error: 'Customer name is required' }

    const { error } = await supabase.from('customers').update({
        name,
        email,
        phone,
        rfc,
        address,
        legal_name: legalName,
        notes,
        updated_at: new Date().toISOString()
    }).eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/inventory/customers')
    return { success: true }
}

export async function deleteCustomer(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/inventory/customers')
}

export async function updateSale(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    const quantity = parseInt(formData.get('quantity') as string)
    const totalPrice = parseFloat(formData.get('total_price') as string)
    const note = formData.get('note') as string
    const taxAmountStr = formData.get('tax_amount') as string
    let taxAmount = 0
    if (taxAmountStr) {
        taxAmount = parseFloat(taxAmountStr)
    }

    try {
        const { error } = await supabase
            .from('sales')
            .update({
                quantity,
                total_price: totalPrice,
                tax_amount: taxAmount,
                note,
            })
            .eq('id', id)

        if (error) {
            console.error('Error updating sale:', error)
            return { error: error.message }
        }

        revalidatePath('/inventory/sales')
        revalidatePath('/dashboard')
    } catch (e) {
        console.error('Action error:', e)
        return { error: 'Unknown error occurred' }
    }
}
