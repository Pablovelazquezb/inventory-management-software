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
    const quantity = parseInt(formData.get('quantity') as string)
    const price = parseFloat(formData.get('price') as string)
    const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null
    const description = formData.get('description') as string

    const { error } = await supabase.from('inventory_items').insert({
        name,
        category,
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
