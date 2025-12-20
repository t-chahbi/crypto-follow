'use client'

import { Button } from "@heroui/react"
import { Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteAlertButtonProps {
    alertId: number
}

export default function DeleteAlertButton({ alertId }: DeleteAlertButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase
                .from('alerts')
                .delete()
                .eq('id', alertId)

            if (error) {
                console.error('Error deleting alert:', error)
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
            <Trash2 size={16} />
        </Button>
    )
}
