"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Item, truncateAddress } from "@/lib/marketplace";

interface ItemCardProps {
  item: Item;
  account: string | null;
  pendingId: number | null;
  onBuy: (id: number) => void;
  onCancel: (id: number) => void;
  onConfirmReceipt: (id: number) => void;
}

export function ItemCard({
  item,
  account,
  pendingId,
  onBuy,
  onCancel,
  onConfirmReceipt,
}: ItemCardProps) {
  const isOwner =
    account !== null && account.toLowerCase() === item.seller.toLowerCase();
  const isBuyer =
    account !== null && account.toLowerCase() === item.buyer?.toLowerCase();
  const isPending = pendingId === item.id;
  const isActive = !item.isSold && !item.isCancelled;

  return (
    <article
      className={`flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors ${
        isActive ? "hover:border-primary/40" : "opacity-80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-snug text-pretty">
          {item.name}
        </h3>
        {item.isSold ? (
          item.paymentLocked ? (
            <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/15">
              Escrow Locked
            </Badge>
          ) : (
            <Badge variant="secondary">Completed</Badge>
          )
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
          {isOwner ? "You" : truncateAddress(item.seller)}
        </span>
      </div>

      {/* ACTION BUTTONS: Buy or Cancel */}
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
              "Cancel listing"
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
              "Connect wallet to buy"
            )}
          </Button>
        ))}

      {/* Escrow Release Button (Visible ONLY to the Buyer when payment is locked) */}
      {item.isSold && item.paymentLocked && isBuyer && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => onConfirmReceipt(item.id)}
          className="bg-green-600 text-white hover:bg-green-700"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              Releasing...
            </>
          ) : (
            "Confirm Received (Release ETH)"
          )}
        </Button>
      )}
    </article>
  );
}
