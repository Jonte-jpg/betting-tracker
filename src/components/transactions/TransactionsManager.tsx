import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import TransactionsTable from './TransactionsTable'
import AddTransactionForm from './AddTransactionForm'
import { useTransactions } from '../../hooks/useTransactions'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'

export function TransactionsManager() {
  const { user } = useAuth()
  const { 
    transactions, 
    loading, 
    error, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    totals,
    bookmakerTotals
  } = useTransactions()
  
  const [activeTab, setActiveTab] = useState('overview')

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-gray-500">Please sign in to manage transactions</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-gray-500">Loading transactions...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Transactions</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="add">Add Transaction</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {totals.deposits.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  kr
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Withdrawals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {totals.withdrawals.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  kr
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Net Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${
                  totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totals.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  kr
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bookmaker Balances</CardTitle>
              <CardDescription>Overview of your deposits and withdrawals by bookmaker</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="h-10 px-4 text-left font-medium">Bookmaker</th>
                      <th className="h-10 px-4 text-right font-medium">Deposits</th>
                      <th className="h-10 px-4 text-right font-medium">Withdrawals</th>
                      <th className="h-10 px-4 text-right font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bookmakerTotals).map(([bookmaker, data]) => (
                      <tr key={bookmaker} className="border-b">
                        <td className="p-4 align-middle font-medium">{bookmaker}</td>
                        <td className="p-4 align-middle text-right text-green-600">
                          {data.deposits.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          kr
                        </td>
                        <td className="p-4 align-middle text-right text-red-600">
                          {data.withdrawals.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          kr
                        </td>
                        <td className={`p-4 align-middle text-right ${
                          data.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {data.balance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          kr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsTable
                transactions={transactions.slice(0, 5)}
                onDeleteTransaction={deleteTransaction}
                onEditTransaction={updateTransaction}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <TransactionsTable
            transactions={transactions}
            onDeleteTransaction={deleteTransaction}
            onEditTransaction={updateTransaction}
          />
        </TabsContent>

        <TabsContent value="add">
          <AddTransactionForm
            onAddTransaction={addTransaction}
            userId={user.uid}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TransactionsManager
