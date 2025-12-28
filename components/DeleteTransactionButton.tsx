'use client'

import { Button } from "@heroui/react"
import { Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteTransactionButtonProps {
    transactionId: number
}

export default function DeleteTransactionButton({ transactionId }: DeleteTransactionButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transactionId)

            if (error) {
                console.error('Error deleting transaction:', error)
                alert('Erreur lors de la suppression')
            } else {
                router.refresh()
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            isIconOnly
            variant="light"
            color="danger"
            size="sm"
            onPress={handleDelete}
            isLoading={loading}
        >
            <Trash2 size={14} />
        </Button>
    )
}
