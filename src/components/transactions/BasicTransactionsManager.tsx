import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'
import { addTestTransaction } from '../../utils/testTransaction'
import { subscribeToTransactions } from '@/lib/firestore'
import { Transaction } from '../../types/Firebase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

// Helpers for status rendering (avoid nested ternaries)
function getStatusClass(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-red-100 text-red-800'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return 'Genomförd'
    case 'pending':
      return 'Avvaktar'
    default:
      return 'Misslyckad'
  }
}

// Helper components extracted to module scope to avoid inline declarations in JSX
function TransactionTable({ transactions }: Readonly<{ transactions: Transaction[] }>) {
  return (
    <div className="border rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Typ</th>
            <th className="p-2 text-left">Belopp</th>
            <th className="p-2 text-left">Bookmaker</th>
            <th className="p-2 text-left">Datum</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-t">
              <td className="p-2">{transaction.type === 'deposit' ? 'Insättning' : 'Uttag'}</td>
              <td className="p-2">{transaction.amount} kr</td>
              <td className="p-2">{transaction.bookmaker}</td>
              <td className="p-2">{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs ${getStatusClass(transaction.status)}`}>
                  {getStatusLabel(transaction.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ErrorView({ error, onRetry }: Readonly<{ error: string; onRetry: () => void }>) {
  return (
    <div>
      <p className="text-red-500">{error}</p>
      {error.includes('index') && (
        <Button
          className="mt-2 mr-2"
          onClick={() =>
            window.open(
              'https://console.firebase.google.com/project/betting-tracker-8dedd/firestore/indexes',
              '_blank'
            )
          }
        >
          Öppna Firebase Console
        </Button>
      )}
      <Button className="mt-4" onClick={onRetry}>
        Försök igen
      </Button>
    </div>
  )
}

function TransactionsView({
  error,
  transactions,
  onRetry,
}: Readonly<{
  error: string | null
  transactions: Transaction[]
  onRetry: () => void
}>) {
  if (error) return <ErrorView error={error} onRetry={onRetry} />
  if (transactions.length === 0) return <p>Inga transaktioner hittades</p>
  return <TransactionTable transactions={transactions} />
}

export function BasicTransactionsManager() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [fetchingTransactions, setFetchingTransactions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('test')
  const [useOrdering, setUseOrdering] = useState(false)

  // Function to add a test transaction
  const handleAddTestTransaction = async () => {
    if (!user) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const id = await addTestTransaction(user.uid);
      setResult(`Test transaktion tillagd med ID: ${id}`);
      // After adding, fetch transactions again
      fetchTransactions();
    } catch (error) {
      console.error(error);
      setResult(`Fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch transactions
  const fetchTransactions = useCallback(() => {
    if (!user) return
    setFetchingTransactions(true)
    setError(null)
    try {
      const unsub = subscribeToTransactions(user.uid, (list) => {
        setTransactions(list)
        setFetchingTransactions(false)
        // If list is empty due to index fallback, show a gentle info once
        if (list.length === 0 && !useOrdering) {
          setError((prev) => prev ?? null)
        }
      })
      return unsub
    } catch (err) {
      console.error('Error setting up transaction listener:', err)
      setError('Kunde inte konfigurera lyssning på transaktioner')
      setFetchingTransactions(false)
    }
  }, [user, useOrdering])

  // Initialize transaction fetching when component mounts or useOrdering changes
  React.useEffect(() => {
    const unsubscribe = fetchTransactions();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchTransactions]);

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-gray-500">Logga in för att hantera transaktioner</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="test">Test</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test">
          <Card className="p-8">
            <CardHeader>
              <CardTitle>Test Transaktioner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Testa att lägga till transaktioner och se om de dyker upp i listan.</p>
              
              <Button 
                onClick={handleAddTestTransaction} 
                disabled={loading}
                className="mb-4"
              >
                {loading ? 'Lägger till...' : 'Lägg till test-transaktion'}
              </Button>
              
              {result && (
                <p className="mt-4 p-2 border rounded">
                  {result}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list">
          <Card className="p-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Transaktioner</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Använd sortering</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <span className="sr-only">Använd sortering efter datum</span>
                    <input 
                      type="checkbox" 
                      checked={useOrdering} 
                      onChange={() => {
                        setUseOrdering(!useOrdering);
                        // Reset error when toggling
                        setError(null);
                      }} 
                      className="sr-only peer"
                      aria-label="Använd sortering efter datum"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {fetchingTransactions ? (
                <p>Hämtar transaktioner...</p>
              ) : (
                <TransactionsView
                  error={error}
                  transactions={transactions}
                  onRetry={() => fetchTransactions()}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default BasicTransactionsManager
