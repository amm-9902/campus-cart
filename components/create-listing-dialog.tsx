'use client'

import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateListingDialogProps {
  account: string | null
  onCreate: (name: string, priceEth: number) => Promise<void>
}

export function CreateListingDialog({
  account,
  onCreate,
}: CreateListingDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const priceNum = Number.parseFloat(price)
  const isValid = name.trim().length > 0 && !Number.isNaN(priceNum) && priceNum > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    await onCreate(name.trim(), priceNum)
    setSubmitting(false)
    setName('')
    setPrice('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button disabled={!account} />}>
        <Plus />
        {account ? 'Create listing' : 'Connect wallet to list'}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a listing</DialogTitle>
          <DialogDescription>
            This calls createListing() on the marketplace contract. Gas fees
            apply on testnet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="item-name">Item name</Label>
            <Input
              id="item-name"
              placeholder="e.g. Physics textbook, 3rd edition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="item-price">Price (test ETH)</Label>
            <Input
              id="item-price"
              type="number"
              inputMode="decimal"
              placeholder="0.01"
              min="0.0001"
              step="0.0001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!isValid || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Waiting for confirmation...
                </>
              ) : (
                'List item'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
