import React, { useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/table'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { format } from 'date-fns'
import { Card } from '../ui/card'
import { Transaction } from '../../types/Firebase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import EditTransactionDialog from './EditTransactionDialog'

interface TransactionsTableProps {
  transactions: Transaction[]
  onDeleteTransaction: (id: string) => Promise<void>
  onEditTransaction: (transaction: Transaction) => Promise<void>
}

export function TransactionsTable({ 
  transactions, 
  onDeleteTransaction, 
  onEditTransaction 
}: TransactionsTableProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const getBadgeColorForType = (type: string) => {
    return type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getBadgeColorForStatus = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleEditComplete = async (transaction: Transaction) => {
    await onEditTransaction(transaction)
    setEditingTransaction(null)
  }

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await onDeleteTransaction(id)
    }
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No transactions found</p>
      </Card>
    )
  }

  return (
    <div>
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          open={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={handleEditComplete}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Bookmaker</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.date), 'yyyy-MM-dd')}
                </TableCell>
                <TableCell>
                  <Badge className={getBadgeColorForType(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {transaction.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  kr
                </TableCell>
                <TableCell>{transaction.bookmaker}</TableCell>
                <TableCell>{transaction.method || '-'}</TableCell>
                <TableCell>
                  <Badge className={getBadgeColorForStatus(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{transaction.notes || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => handleEditClick(transaction)}
                    variant="ghost"
                    className="h-8 w-8 p-0 mr-2"
                  >
                    <span className="sr-only">Edit</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(transaction.id!)}
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Delete</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default TransactionsTable
