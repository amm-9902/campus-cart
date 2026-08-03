"use client";

import { Loader2, Plus, ImageIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateListingDialogProps {
  account: string | null;
  // Updated to include imageUrl
  onCreate: (name: string, imageUrl: string, priceEth: number) => Promise<void>;
}

export function CreateListingDialog({
  account,
  onCreate,
}: CreateListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const priceNum = Number.parseFloat(price);
  const isValid =
    name.trim().length > 0 &&
    imageUrl.trim().length > 0 &&
    !Number.isNaN(priceNum) &&
    priceNum > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);

    try {
      await onCreate(name.trim(), imageUrl.trim(), priceNum);
      setName("");
      setImageUrl("");
      setPrice("");
      setImgError(false);
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button disabled={!account} />}>
        <Plus className="mr-2 h-4 w-4" />
        {account ? "Create listing" : "Connect wallet to list"}
      </DialogTrigger>

      {/* Added max-height and overflow-y-auto to handle the taller form nicely */}
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a listing</DialogTitle>
          <DialogDescription>Gas fees may apply on testnet.</DialogDescription>
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

          {/* New Image URL Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="item-image">Image URL</Label>
            <Input
              id="item-image"
              type="url"
              placeholder="https://example.com/image.png"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImgError(false); // Reset error state when user types
              }}
              required
            />
          </div>

          {/* New Image Preview Area */}
          <div className="flex flex-col gap-2">
            <Label>Image Preview</Label>
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
              {imageUrl.trim() && !imgError ? (
                <img
                  src={imageUrl.trim()}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="size-8 stroke-1 text-muted-foreground/60" />
                  <span>
                    {imgError
                      ? "Failed to load image link"
                      : "Enter a valid URL above to preview"}
                  </span>
                </div>
              )}
            </div>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Waiting for confirmation...
                </>
              ) : (
                "List item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
