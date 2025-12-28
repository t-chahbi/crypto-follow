'use client'

import { useState } from 'react'
import { Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tabs, Tab } from "@heroui/react"
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
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

export default function AddTransactionForm() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY')
    const [cryptoSymbol, setCryptoSymbol] = useState('')
    const [amount, setAmount] = useState('')
    const [pricePerCoin, setPricePerCoin] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)

        try {
            // Validate inputs
            if (!cryptoSymbol || !amount || !pricePerCoin) {
                throw new Error('Veuillez remplir tous les champs')
            }

            const amountNum = parseFloat(amount)
            const priceNum = parseFloat(pricePerCoin)

            if (isNaN(amountNum) || amountNum <= 0) {
                throw new Error('La quantité doit être un nombre positif')
            }

            if (isNaN(priceNum) || priceNum <= 0) {
                throw new Error('Le prix doit être un nombre positif')
            }

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('Vous devez être connecté')
            }

            // Insert transaction
            const { error: insertError } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    crypto_symbol: cryptoSymbol,
                    type: transactionType,
                    amount: amountNum,
                    price_per_coin: priceNum,
                })

            if (insertError) {
                throw new Error(insertError.message)
            }

            // Close modal and refresh
            onOpenChange()
            router.refresh()

            // Reset form
            setCryptoSymbol('')
            setAmount('')
            setPricePerCoin('')
            setTransactionType('BUY')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const totalValue = (parseFloat(amount) || 0) * (parseFloat(pricePerCoin) || 0)

    return (
        <>
            <Button
                color="primary"
                onPress={onOpen}
                startContent={<Plus size={18} />}
            >
                Nouvelle Transaction
            </Button>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Ajouter une Transaction
                            </ModalHeader>
                            <ModalBody>
                                {/* Transaction Type Tabs */}
                                <Tabs
                                    selectedKey={transactionType}
                                    onSelectionChange={(key) => setTransactionType(key as 'BUY' | 'SELL')}
                                    color={transactionType === 'BUY' ? 'success' : 'danger'}
                                    variant="bordered"
                                    fullWidth
                                >
                                    <Tab
                                        key="BUY"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={16} />
                                                <span>Achat</span>
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="SELL"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <TrendingDown size={16} />
                                                <span>Vente</span>
                                            </div>
                                        }
                                    />
                                </Tabs>

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

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Quantité"
                                        placeholder="Ex: 0.5"
                                        value={amount}
                                        onValueChange={setAmount}
                                    />

                                    <Input
                                        type="number"
                                        label="Prix par unité ($)"
                                        placeholder="Ex: 50000"
                                        value={pricePerCoin}
                                        onValueChange={setPricePerCoin}
                                        startContent={
                                            <span className="text-default-400 text-sm">$</span>
                                        }
                                    />
                                </div>

                                {/* Total Preview */}
                                {totalValue > 0 && (
                                    <div className={`p-4 rounded-lg ${transactionType === 'BUY' ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'}`}>
                                        <p className="text-sm text-gray-400 mb-1">
                                            Total {transactionType === 'BUY' ? 'investi' : 'récupéré'}
                                        </p>
                                        <p className={`text-2xl font-mono font-bold ${transactionType === 'BUY' ? 'text-success' : 'text-danger'}`}>
                                            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                    color={transactionType === 'BUY' ? 'success' : 'danger'}
                                    onPress={handleSubmit}
                                    isLoading={loading}
                                >
                                    {transactionType === 'BUY' ? 'Acheter' : 'Vendre'}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
