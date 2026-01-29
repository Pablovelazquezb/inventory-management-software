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

    const { error } = await supabase.from('inventory_items').insert({
        name,
        category, // keeping this for backward compat or we can switch to category_id if we want strict FKs later, but user RLS fix kept it as string name. 
        // Wait, the previous RLS fix kept 'category' as a string in the insert, but we have a 'categories' table now. 
        // The current schema uses 'category' column in 'inventory_items' (text) and a separate 'categories' table. 
        // Ideally we should link them, but let's stick to the current pattern unless specified.
        // The implementation plan added 'subcategory_id'. 
        subcategory_id: subcategoryId,
        quantity,
        price,
        weight,
        description,
        user_id: user.id
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/inventory')
    redirect('/inventory')
}

export async function deleteItem(id: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('inventory_items').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/inventory')
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
