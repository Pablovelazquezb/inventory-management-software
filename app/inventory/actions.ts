'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createItem(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to create items' }
    }

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const subcategoryId = formData.get('subcategory_id') as string || null
    const quantity = parseInt(formData.get('quantity') as string)
    const price = parseFloat(formData.get('price') as string)
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const description = formData.get('description') as string

    const { data: item, error: itemError } = await supabase.from('inventory_items').insert({
        name,
        category, // keeping this for backward compat
        subcategory_id: subcategoryId,
        quantity,
        price,
        weight,
        description,
        user_id: user.id
    }).select().single()

    if (itemError) {
        return { error: itemError.message }
    }

    // Record initial stock entry
    await supabase.from('stock_entries').insert({
        item_id: item.id,
        quantity_added: quantity,
        user_id: user.id
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

export async function sellItem(id: string, quantitySold: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Get item
    const { data: item, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single()

    if (fetchError || !item) return { error: 'Item not found' }
    if (item.quantity < quantitySold) return { error: 'Insufficient stock' }

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
        user_id: user.id
    })

    if (saleError) console.error('Error recording sale:', saleError)

    revalidatePath('/inventory')
    revalidatePath('/dashboard')
}

export async function restockItem(id: string, quantityAdded: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Get item
    const { data: item, error: fetchError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', id)
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
        user_id: user.id
    })

    revalidatePath('/inventory')
    revalidatePath('/dashboard')
}

export async function createSubcategory(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to create subcategories' }
    }

    const name = formData.get('name') as string
    const categoryId = formData.get('category_id') as string

    if (!name || name.trim() === '') {
        return { error: 'Subcategory name is required' }
    }
    if (!categoryId) {
        return { error: 'Category ID is required' }
    }

    const { error } = await supabase.from('subcategories').insert({
        name,
        category_id: categoryId,
        user_id: user.id
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

    if (!user) {
        return { error: 'You must be logged in to create categories' }
    }

    const name = formData.get('name') as string

    if (!name || name.trim() === '') {
        return { error: 'Category name is required' }
    }

    const { error } = await supabase.from('categories').insert({
        name,
        user_id: user.id
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
    const quantity = parseInt(formData.get('quantity') as string)
    const price = parseFloat(formData.get('price') as string)
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const description = formData.get('description') as string

    const { error } = await supabase.from('inventory_items').update({
        name,
        category,
        subcategory_id: subcategoryId,
        quantity,
        price,
        weight,
        description
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
