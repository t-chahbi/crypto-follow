'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Select, SelectItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Tabs, Tab, Spinner } from "@heroui/react"
import { Plus, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

const popularCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum' },
    { symbol: 'BNB', name: 'Binance Coin', coingeckoId: 'binancecoin' },
    { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana' },
    { symbol: 'XRP', name: 'Ripple', coingeckoId: 'ripple' },
    { symbol: 'ADA', name: 'Cardano', coingeckoId: 'cardano' },
    { symbol: 'DOGE', name: 'Dogecoin', coingeckoId: 'dogecoin' },
    { symbol: 'DOT', name: 'Polkadot', coingeckoId: 'polkadot' },
    { symbol: 'MATIC', name: 'Polygon', coingeckoId: 'matic-network' },
    { symbol: 'LTC', name: 'Litecoin', coingeckoId: 'litecoin' },
]

interface AddTransactionFormProps {
    currentBalance: number
    holdings: Map<string, number> // symbol -> amount held
}

export default function AddTransactionForm({ currentBalance, holdings }: AddTransactionFormProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [loading, setLoading] = useState(false)
    const [priceLoading, setPriceLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY')
    const [cryptoSymbol, setCryptoSymbol] = useState('')
    const [amount, setAmount] = useState('')
    const [currentPrice, setCurrentPrice] = useState<number | null>(null)
    const router = useRouter()
    const supabase = createClient()

    // Fetch real-time price when crypto changes
    useEffect(() => {
        if (!cryptoSymbol) {
            setCurrentPrice(null)
            return
        }

        const fetchPrice = async () => {
            setPriceLoading(true)
            try {
                const crypto = popularCryptos.find(c => c.symbol === cryptoSymbol)
                if (!crypto) return

                const res = await fetch(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${crypto.coingeckoId}&vs_currencies=usd`
                )
                const data = await res.json()
                const price = data[crypto.coingeckoId]?.usd
                setCurrentPrice(price || null)
            } catch (err) {
                console.error('Error fetching price:', err)
                setCurrentPrice(null)
            } finally {
                setPriceLoading(false)
            }
        }

        fetchPrice()
    }, [cryptoSymbol])

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)

        try {
            if (!cryptoSymbol || !amount || !currentPrice) {
                throw new Error('Veuillez remplir tous les champs')
            }

            const amountNum = parseFloat(amount)
            if (isNaN(amountNum) || amountNum <= 0) {
                throw new Error('La quantité doit être un nombre positif')
            }

            const totalCost = amountNum * currentPrice

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                throw new Error('Vous devez être connecté')
            }

            if (transactionType === 'BUY') {
                // Check sufficient balance
                if (totalCost > currentBalance) {
                    throw new Error(`Solde insuffisant. Vous avez $${currentBalance.toLocaleString()} mais l'achat coûte $${totalCost.toLocaleString()}`)
                }

                // Deduct from balance
                const { error: balanceError } = await supabase
                    .from('profiles')
                    .update({ balance: currentBalance - totalCost })
                    .eq('id', user.id)

                if (balanceError) throw new Error(balanceError.message)
            } else {
                // SELL - Check sufficient holdings
                const currentHolding = holdings.get(cryptoSymbol) || 0
                if (amountNum > currentHolding) {
                    throw new Error(`Vous n'avez que ${currentHolding.toFixed(4)} ${cryptoSymbol}`)
                }

                // Add to balance
                const { error: balanceError } = await supabase
                    .from('profiles')
                    .update({ balance: currentBalance + totalCost })
                    .eq('id', user.id)

                if (balanceError) throw new Error(balanceError.message)
            }

            // Ensure crypto asset exists
            const cryptoInfo = popularCryptos.find(c => c.symbol === cryptoSymbol)
            await supabase
                .from('crypto_assets')
                .upsert({
                    symbol: cryptoSymbol,
                    name: cryptoInfo?.name || cryptoSymbol,
                    coin_cap_id: cryptoInfo?.coingeckoId || cryptoSymbol.toLowerCase(),
                }, { onConflict: 'symbol' })

            // Insert transaction
            const { error: insertError } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    crypto_symbol: cryptoSymbol,
                    type: transactionType,
                    amount: amountNum,
                    price_per_coin: currentPrice,
                    total_cost: totalCost,
                })

            if (insertError) throw new Error(insertError.message)

            // Close modal and refresh
            onOpenChange()
            router.refresh()
            setCryptoSymbol('')
            setAmount('')
            setTransactionType('BUY')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const totalCost = (parseFloat(amount) || 0) * (currentPrice || 0)
    const currentHolding = holdings.get(cryptoSymbol) || 0

    return (
        <>
            <Button
                color="primary"
                onPress={onOpen}
                startContent={<Plus size={18} />}
            >
                Trader
            </Button>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="lg">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Acheter / Vendre des Cryptos
                            </ModalHeader>
                            <ModalBody>
                                {/* Balance Display */}
                                <div className="p-3 bg-white/5 rounded-lg mb-4 flex justify-between items-center">
                                    <span className="text-gray-400">Solde disponible</span>
                                    <span className="font-mono font-bold text-lg text-indigo-400">
                                        ${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

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
                                                <span>Acheter</span>
                                            </div>
                                        }
                                    />
                                    <Tab
                                        key="SELL"
                                        title={
                                            <div className="flex items-center gap-2">
                                                <TrendingDown size={16} />
                                                <span>Vendre</span>
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

                                {/* Current Price Display */}
                                {cryptoSymbol && (
                                    <div className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                                        <span className="text-gray-400">Prix actuel ({cryptoSymbol})</span>
                                        {priceLoading ? (
                                            <Spinner size="sm" />
                                        ) : currentPrice ? (
                                            <span className="font-mono font-bold text-green-400">
                                                ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </span>
                                        ) : (
                                            <span className="text-danger">Prix non disponible</span>
                                        )}
                                    </div>
                                )}

                                {/* Show holdings for SELL */}
                                {transactionType === 'SELL' && cryptoSymbol && (
                                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                                        <span className="text-gray-400">Vous possédez: </span>
                                        <span className="font-mono font-bold text-orange-400">
                                            {currentHolding.toFixed(4)} {cryptoSymbol}
                                        </span>
                                    </div>
                                )}

                                <Input
                                    type="number"
                                    label={`Quantité de ${cryptoSymbol || 'crypto'}`}
                                    placeholder="Ex: 0.5"
                                    value={amount}
                                    onValueChange={setAmount}
                                />

                                {/* Total Preview */}
                                {totalCost > 0 && (
                                    <div className={`p-4 rounded-lg ${transactionType === 'BUY' ? 'bg-success/10 border border-success/20' : 'bg-danger/10 border border-danger/20'}`}>
                                        <p className="text-sm text-gray-400 mb-1">
                                            {transactionType === 'BUY' ? 'Coût total' : 'Vous recevrez'}
                                        </p>
                                        <p className={`text-2xl font-mono font-bold ${transactionType === 'BUY' ? 'text-success' : 'text-danger'}`}>
                                            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        {transactionType === 'BUY' && totalCost > currentBalance && (
                                            <p className="text-xs text-danger flex items-center gap-1 mt-2">
                                                <AlertCircle size={12} /> Solde insuffisant
                                            </p>
                                        )}
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
                                    isDisabled={!currentPrice || (transactionType === 'BUY' && totalCost > currentBalance)}
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
