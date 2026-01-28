'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createItem(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const quantity = parseInt(formData.get('quantity') as string)
    const price = parseFloat(formData.get('price') as string)
    const description = formData.get('description') as string

    const { error } = await supabase.from('inventory_items').insert({
        name,
        category,
        quantity,
        price,
        description,
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
