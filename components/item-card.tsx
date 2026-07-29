'use client'

import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Item, truncateAddress } from '@/lib/marketplace'

interface ItemCardProps {
  item: Item
  account: string | null
  pendingId: number | null
  onBuy: (id: number) => void
  onCancel: (id: number) => void
}

export function ItemCard({
  item,
  account,
  pendingId,
  onBuy,
  onCancel,
}: ItemCardProps) {
  const isOwner = account !== null && account === item.seller
  const isPending = pendingId === item.id
  const isActive = !item.isSold && !item.isCancelled

  return (
    <article
      className={`flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors ${
        isActive ? 'hover:border-primary/40' : 'opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-snug text-pretty">
          {item.name}
        </h3>
        {item.isSold ? (
          <Badge variant="secondary">Sold</Badge>
        ) : item.isCancelled ? (
          <Badge variant="outline">Cancelled</Badge>
        ) : (
          <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
            Available
          </Badge>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-semibold tabular-nums">
          {item.priceEth}
        </span>
        <span className="text-xs text-muted-foreground">ETH</span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Seller</span>
        <span className="font-mono">
          {isOwner ? 'You' : truncateAddress(item.seller)}
        </span>
      </div>

      {isActive &&
        (isOwner ? (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onCancel(item.id)}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel listing'
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={isPending || !account}
            onClick={() => onBuy(item.id)}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Confirming tx...
              </>
            ) : account ? (
              `Buy for ${item.priceEth} ETH`
            ) : (
              'Connect wallet to buy'
            )}
          </Button>
        ))}
    </article>
  )
}
