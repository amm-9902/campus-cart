import { ethers } from "ethers";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "./contract";

export interface Item {
  id: number;
  seller: string;
  name: string;
  priceEth: number;
  isSold: boolean;
  isCancelled: boolean;
  buyer?: string;
  paymentLocked: boolean;
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  throw new Error("MetaMask is not installed");
}

export async function connectWallet(): Promise<string> {
  const provider = getProvider();
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}

export async function fetchAllItems(): Promise<Item[]> {
  const provider = getProvider();
  const contract = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    MARKETPLACE_ABI,
    provider,
  );

  const countBigInt = await contract.itemCount();
  const total = Number(countBigInt);
  const items: Item[] = [];

  for (let i = 1; i <= total; i++) {
    const itemData = await contract.items(i);
    const buyer = await contract.buyers(i);
    const isLocked = await contract.paymentLocked(i);

    items.push({
      id: Number(itemData.id),
      seller: itemData.seller,
      name: itemData.name,
      priceEth: Number(ethers.formatEther(itemData.price)),
      isSold: itemData.isSold,
      isCancelled: itemData.isCancelled,
      buyer: buyer !== ethers.ZeroAddress ? buyer : undefined,
      paymentLocked: isLocked,
    });
  }

  return items.reverse();
}

export async function listNewItem(
  name: string,
  priceEth: number,
): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    MARKETPLACE_ABI,
    signer,
  );

  const priceWei = ethers.parseEther(priceEth.toString());
  const tx = await contract.createListing(name, priceWei);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function buyMarketplaceItem(
  id: number,
  priceEth: number,
): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    MARKETPLACE_ABI,
    signer,
  );

  const priceWei = ethers.parseEther(priceEth.toString());
  const tx = await contract.buyItem(id, { value: priceWei });
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function cancelMarketplaceItem(id: number): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    MARKETPLACE_ABI,
    signer,
  );

  const tx = await contract.cancelListing(id);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function confirmReceivedItem(id: number): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    MARKETPLACE_ADDRESS,
    MARKETPLACE_ABI,
    signer,
  );

  const tx = await contract.confirmReceived(id);
  const receipt = await tx.wait();
  return receipt.hash;
}
