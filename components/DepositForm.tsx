'use client'

import { useState } from 'react'
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react"
import { DollarSign } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function DepositForm({ currentBalance }: { currentBalance: number }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [amount, setAmount] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleDeposit = async () => {
        setLoading(true)
        setError(null)

        try {
            const depositAmount = parseFloat(amount)
            if (isNaN(depositAmount) || depositAmount <= 0) {
                throw new Error('Le montant doit être un nombre positif')
            }

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('Vous devez être connecté')
            }

            // Update balance
            const newBalance = currentBalance + depositAmount
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ balance: newBalance })
                .eq('id', user.id)

            if (updateError) {
                throw new Error(updateError.message)
            }

            // Close modal and refresh
            onOpenChange()
            router.refresh()
            setAmount('')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const presetAmounts = [1000, 5000, 10000, 50000]

    return (
        <>
            <Button
                color="success"
                variant="flat"
                onPress={onOpen}
                startContent={<DollarSign size={18} />}
            >
                Déposer
            </Button>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Déposer de l'argent
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-gray-400 text-sm mb-4">
                                    Ajoutez des fonds virtuels à votre portefeuille pour acheter des cryptomonnaies.
                                </p>

                                {/* Preset amounts */}
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {presetAmounts.map((preset) => (
                                        <Button
                                            key={preset}
                                            size="sm"
                                            variant={amount === String(preset) ? 'solid' : 'bordered'}
                                            color={amount === String(preset) ? 'success' : 'default'}
                                            onPress={() => setAmount(String(preset))}
                                        >
                                            ${preset.toLocaleString()}
                                        </Button>
                                    ))}
                                </div>

                                <Input
                                    type="number"
                                    label="Montant personnalisé ($)"
                                    placeholder="Entrez un montant"
                                    value={amount}
                                    onValueChange={setAmount}
                                    startContent={
                                        <span className="text-default-400 text-sm">$</span>
                                    }
                                />

                                {amount && parseFloat(amount) > 0 && (
                                    <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                                        <p className="text-sm text-gray-400 mb-1">Nouveau solde</p>
                                        <p className="text-2xl font-mono font-bold text-success">
                                            ${(currentBalance + parseFloat(amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                )}

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
                                    color="success"
                                    onPress={handleDeposit}
                                    isLoading={loading}
                                >
                                    Déposer ${amount || '0'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
