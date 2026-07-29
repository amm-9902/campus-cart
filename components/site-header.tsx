"use client";

import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/marketplace";
import Logo from "./campus-cart-logo.png";

interface SiteHeaderProps {
  account: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SiteHeader({
  account,
  isConnecting,
  onConnect,
  onDisconnect,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <img
              src={"./campus-cart-logo.png"}
              alt="icon"
              className="rounded"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Campus Cart</span>
            <span className="text-xs text-muted-foreground">
              Student Marketplace DApp
            </span>
          </div>
        </div>

        {account ? (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
              <span
                className="size-2 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span className="font-mono text-xs text-foreground">
                {truncateAddress(account)}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={onDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={onConnect} disabled={isConnecting}>
            {isConnecting ? (
              <>
                <Loader2 className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet />
                Connect MetaMask
              </>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
