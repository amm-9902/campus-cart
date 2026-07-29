"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CreateListingDialog } from "@/components/create-listing-dialog";
import { ItemCard } from "@/components/item-card";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  type Item,
  connectWallet,
  fetchAllItems,
  listNewItem,
  buyMarketplaceItem,
  cancelMarketplaceItem,
  confirmReceivedItem,
  truncateAddress,
} from "@/lib/marketplace";

type Filter = "all" | "available" | "mine";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All items" },
  { key: "available", label: "Available" },
  { key: "mine", label: "My listings" },
];

export default function MarketplacePage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  // Load items from the blockchain on mount
  async function loadItems() {
    try {
      setLoading(true);
      const data = await fetchAllItems();
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blockchain items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const visibleItems = useMemo(() => {
    if (filter === "available")
      return items.filter((i) => !i.isSold && !i.isCancelled);
    if (filter === "mine")
      return items.filter(
        (i) => i.seller.toLowerCase() === account?.toLowerCase(),
      );
    return items;
  }, [items, filter, account]);

  const availableCount = items.filter(
    (i) => !i.isSold && !i.isCancelled,
  ).length;
  const soldCount = items.filter((i) => i.isSold).length;

  async function handleConnect() {
    try {
      setIsConnecting(true);
      const address = await connectWallet();
      setAccount(address);
      toast.success("Wallet connected", {
        description: truncateAddress(address),
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }

  function handleDisconnect() {
    setAccount(null);
    setFilter("all");
    toast("Wallet disconnected");
  }

  async function handleBuy(id: number, priceEth: number) {
    if (!account) return;
    try {
      setPendingId(id);
      const txHash = await buyMarketplaceItem(id, priceEth);
      toast.success("Purchase confirmed", {
        description: `Tx ${truncateAddress(txHash)} mined`,
      });
      await loadItems(); // Refresh state from chain
    } catch (err: any) {
      toast.error(err.reason || err.message || "Purchase failed");
    } finally {
      setPendingId(null);
    }
  }

  async function handleCancel(id: number) {
    try {
      setPendingId(id);
      const txHash = await cancelMarketplaceItem(id);
      toast("Listing cancelled", {
        description: `Tx ${truncateAddress(txHash)} mined`,
      });
      await loadItems(); // Refresh state from chain
    } catch (err: any) {
      toast.error(err.reason || err.message || "Cancel failed");
    } finally {
      setPendingId(null);
    }
  }

  async function handleConfirmReceipt(id: number) {
    try {
      setPendingId(id);
      const txHash = await confirmReceivedItem(id);
      toast.success("Escrow released to seller", {
        description: `Tx ${truncateAddress(txHash)} mined`,
      });
      await loadItems();
    } catch (err: any) {
      toast.error(err.reason || err.message || "Failed to confirm receipt");
    } finally {
      setPendingId(null);
    }
  }

  async function handleCreate(name: string, priceEth: number) {
    if (!account) return;
    try {
      const txHash = await listNewItem(name, priceEth);
      toast.success("Item listed", {
        description: `Tx ${truncateAddress(txHash)} mined`,
      });
      await loadItems(); // Refresh state from chain
    } catch (err: any) {
      toast.error(err.reason || err.message || "Listing failed");
      throw err;
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader
        account={account}
        isConnecting={isConnecting}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6">
        {/* Hero Section */}
        <section className="mb-10 flex flex-col gap-4">
          <div className="flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
            <span
              className="size-1.5 rounded-full bg-primary"
              aria-hidden="true"
            />
            <span className="font-mono text-xs text-muted-foreground">
              Sepolia Testnet · Live Chain
            </span>
          </div>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Buy and sell on campus, settled on-chain
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            A decentralized marketplace for students. List your stuff, pay with
            test ETH, no middleman — every trade lives on the blockchain.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-6">
            <div className="flex flex-col">
              <span className="font-mono text-xl font-semibold tabular-nums">
                {items.length}
              </span>
              <span className="text-xs text-muted-foreground">
                Total listings
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xl font-semibold tabular-nums">
                {availableCount}
              </span>
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xl font-semibold tabular-nums">
                {soldCount}
              </span>
              <span className="text-xs text-muted-foreground">Sold</span>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex items-center gap-1.5"
            role="group"
            aria-label="Filter listings"
          >
            {FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? "secondary" : "ghost"}
                size="sm"
                disabled={f.key === "mine" && !account}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <CreateListingDialog account={account} onCreate={handleCreate} />
        </section>

        {/* Grid */}
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Loading items from smart contract...
          </div>
        ) : visibleItems.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                account={account}
                pendingId={pendingId}
                onBuy={(id) => handleBuy(id, item.priceEth)}
                onCancel={handleCancel}
                onConfirmReceipt={handleConfirmReceipt}
              />
            ))}
          </section>
        ) : (
          <section className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium">No listings here yet</p>
            <p className="text-xs text-muted-foreground">
              {filter === "mine"
                ? "Create your first listing to see it here."
                : "Check back soon."}
            </p>
          </section>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row md:px-6">
          <span className="text-xs text-muted-foreground">
            CampusBazaar — StudentMarketplace.sol
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            Connected to 0x3c34...b25f
          </span>
        </div>
      </footer>
    </div>
  );
}
