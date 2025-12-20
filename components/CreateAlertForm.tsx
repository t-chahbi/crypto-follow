'use client'

import { useState } from 'react'
import { Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react"
import { Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const popularCryptos = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'XRP', name: 'Ripple' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'LTC', name: 'Litecoin' },
]

const conditions = [
    { value: 'ABOVE', label: 'Supérieur à' },
    { value: 'BELOW', label: 'Inférieur à' },
]

export default function CreateAlertForm() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cryptoSymbol, setCryptoSymbol] = useState('')
    const [condition, setCondition] = useState('')
    const [targetPrice, setTargetPrice] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)

        try {
            // Validate inputs
            if (!cryptoSymbol || !condition || !targetPrice) {
                throw new Error('Veuillez remplir tous les champs')
            }

            const price = parseFloat(targetPrice)
            if (isNaN(price) || price <= 0) {
                throw new Error('Le prix doit être un nombre positif')
            }

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('Vous devez être connecté')
            }

            // Insert alert
            const { error: insertError } = await supabase
                .from('alerts')
                .insert({
                    user_id: user.id,
                    crypto_symbol: cryptoSymbol,
                    condition: condition,
                    target_price: price,
                    is_active: true,
                })

            if (insertError) {
                throw new Error(insertError.message)
            }

            // Close modal and refresh
            onOpenChange()
            router.refresh()

            // Reset form
            setCryptoSymbol('')
            setCondition('')
            setTargetPrice('')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button
                color="primary"
                onPress={onOpen}
                startContent={<Plus size={18} />}
            >
                Nouvelle Alerte
            </Button>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Créer une Alerte de Prix
                            </ModalHeader>
                            <ModalBody>
                                <Select
                                    label="Cryptomonnaie"
                                    placeholder="Sélectionner un actif"
                                    selectedKeys={cryptoSymbol ? [cryptoSymbol] : []}
                                    onSelectionChange={(keys) => setCryptoSymbol(Array.from(keys)[0] as string)}
                                >
                                    {popularCryptos.map((crypto) => (
                                        <SelectItem key={crypto.symbol}>
                                            {crypto.symbol} - {crypto.name}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Select
                                    label="Condition"
                                    placeholder="Choisir une condition"
                                    selectedKeys={condition ? [condition] : []}
                                    onSelectionChange={(keys) => setCondition(Array.from(keys)[0] as string)}
                                >
                                    {conditions.map((cond) => (
                                        <SelectItem key={cond.value}>
                                            {cond.label}
                                        </SelectItem>
                                    ))}
                                </Select>

                                <Input
                                    type="number"
                                    label="Prix cible ($)"
                                    placeholder="Ex: 50000"
                                    value={targetPrice}
                                    onValueChange={setTargetPrice}
                                    startContent={
                                        <span className="text-default-400 text-sm">$</span>
                                    }
                                />

                                {error && (
                                    <div className="text-sm text-danger text-center p-2 bg-danger/10 rounded-lg">
                                        {error}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Annuler
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleSubmit}
                                    isLoading={loading}
                                >
                                    Créer l'alerte
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
