"use client";

import { useState } from "react";
import { Loader2, ImageIcon } from "lucide-react";
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
  const [imgError, setImgError] = useState(false);

  const isOwner =
    account !== null && account.toLowerCase() === item.seller.toLowerCase();
  const isBuyer =
    account !== null && account.toLowerCase() === item.buyer?.toLowerCase();
  const isPending = pendingId === item.id;
  const isActive = !item.isSold && !item.isCancelled;

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 ${
        isActive ? "hover:border-primary/40 hover:shadow-md" : "opacity-80"
      }`}
    >
      {/* --- IMAGE FOCUSED HEADER --- */}
      <div className="relative aspect-square w-full overflow-hidden border-b border-border bg-muted/30">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/50">
            <ImageIcon className="mb-2 size-12 stroke-1" />
            <span className="text-xs font-medium">No Image</span>
          </div>
        )}

        {/* Status Badges Overlaid on Image for visual flair */}
        <div className="absolute right-3 top-3">
          {item.isSold ? (
            item.paymentLocked ? (
              <Badge className="bg-amber-500/90 text-white hover:bg-amber-500/90 shadow-sm backdrop-blur-md">
                {" "}
                Escrow Locked
              </Badge>
            ) : (
              <Badge variant="secondary" className="shadow-sm backdrop-blur-md">
                Completed
              </Badge>
            )
          ) : item.isCancelled ? (
            <Badge
              variant="outline"
              className="bg-background/80 shadow-sm backdrop-blur-md"
            >
              Cancelled
            </Badge>
          ) : (
            <Badge className="bg-primary text-primary-foreground hover:bg-primary shadow-sm backdrop-blur-md">
              {" "}
              Available
            </Badge>
          )}
        </div>
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1.5">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-pretty">
            {item.name}
          </h3>{" "}
          <div className="flex items-baseline gap-1.5 text-primary">
            <span className="font-mono text-2xl font-bold tabular-nums tracking-tight">
              {item.priceEth}
            </span>{" "}
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              ETH
            </span>{" "}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Seller</span>
          <span className="font-mono font-medium rounded-md bg-secondary/50 px-2 py-0.5">
            {isOwner ? "You" : truncateAddress(item.seller)}
          </span>{" "}
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="mt-2 flex flex-col gap-2">
          {isActive &&
            (isOwner ? (
              <Button
                variant="outline"
                className="w-full"
                disabled={isPending}
                onClick={() => onCancel(item.id)}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel listing"
                )}{" "}
              </Button>
            ) : (
              <Button
                className="w-full font-semibold shadow-sm"
                disabled={isPending || !account}
                onClick={() => onBuy(item.id)}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Confirming tx...
                  </>
                ) : account ? (
                  `Buy Now`
                ) : (
                  "Connect wallet to buy"
                )}{" "}
              </Button>
            ))}

          {/* Escrow Release Button */}
          {item.isSold && item.paymentLocked && isBuyer && (
            <Button
              className="w-full bg-green-600 font-semibold text-white hover:bg-green-700 shadow-sm"
              disabled={isPending}
              onClick={() => onConfirmReceipt(item.id)}
            >
              {" "}
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Releasing...
                </>
              ) : (
                "Confirm Received (Release ETH)"
              )}{" "}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
