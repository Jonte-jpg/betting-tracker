import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { useAuth } from '../../hooks/useAuth'
import { addTestTransaction } from '../../utils/testTransaction'

export function TransactionsManager() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-gray-500">Logga in för att hantera transaktioner</p>
        </CardContent>
      </Card>
    )
  }

  const handleAddTestTransaction = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const id = await addTestTransaction(user.uid);
      setResult(`Test transaktion tillagd med ID: ${id}`);
    } catch (error) {
      console.error(error);
      setResult(`Fel: ${error instanceof Error ? error.message : 'Okänt fel'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="p-8">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">Transaktioner</h2>
          <p className="mb-4">Transaktionshantering är under utveckling.</p>
          
          <Button 
            onClick={handleAddTestTransaction} 
            disabled={loading}
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
    </div>
  )
}

export default TransactionsManager
