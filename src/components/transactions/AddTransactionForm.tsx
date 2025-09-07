import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Transaction } from '../../types/Firebase'
import { format } from 'date-fns'

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Transaction) => Promise<void>
  userId: string
}

export function AddTransactionForm({ onAddTransaction, userId }: AddTransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>({
    userId,
    type: 'deposit',
    amount: 0,
    bookmaker: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    method: '',
    status: 'completed',
    tags: []
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Add timestamps
      const newTransaction: Transaction = {
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await onAddTransaction(newTransaction)
      
      // Reset form after successful submission
      setFormData({
        userId,
        type: 'deposit',
        amount: 0,
        bookmaker: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
        method: '',
        status: 'completed',
        tags: []
      })
    } catch (error) {
      console.error('Error adding transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <select
                id="type"
                name="type"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookmaker">Bookmaker</Label>
              <Input
                id="bookmaker"
                name="bookmaker"
                value={formData.bookmaker}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method</Label>
              <Input
                id="method"
                name="method"
                value={formData.method || ''}
                onChange={handleChange}
                placeholder="e.g., Swish, Bank transfer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Transaction'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default AddTransactionForm
