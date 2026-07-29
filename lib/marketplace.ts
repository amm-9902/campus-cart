// Mirrors the Item struct in StudentMarketplace.sol.
// All of this is mock data until the contract address + ABI are wired up.

export interface Item {
  id: number
  seller: string
  name: string
  priceEth: number
  isSold: boolean
  isCancelled: boolean
  buyer?: string
}

// The fake wallet the "Connect MetaMask" button resolves to
export const MOCK_WALLET = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'

const SELLER_A = '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE'
const SELLER_B = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
const SELLER_C = '0xdD870fA1b7C4700F2BD7f44238821C26f7392148'

export const INITIAL_ITEMS: Item[] = [
  {
    id: 1,
    seller: SELLER_A,
    name: 'TI-84 Plus Graphing Calculator',
    priceEth: 0.015,
    isSold: false,
    isCancelled: false,
  },
  {
    id: 2,
    seller: SELLER_B,
    name: 'Intro to Algorithms (CLRS), 4th Ed.',
    priceEth: 0.008,
    isSold: false,
    isCancelled: false,
  },
  {
    id: 3,
    seller: SELLER_C,
    name: 'Mini Fridge — dorm approved',
    priceEth: 0.04,
    isSold: true,
    isCancelled: false,
    buyer: SELLER_A,
  },
  {
    id: 4,
    seller: SELLER_B,
    name: 'Mechanical Keyboard (Blue Switches)',
    priceEth: 0.022,
    isSold: false,
    isCancelled: false,
  },
  {
    id: 5,
    seller: SELLER_C,
    name: 'Acoustic Guitar + Gig Bag',
    priceEth: 0.055,
    isSold: false,
    isCancelled: false,
  },
  {
    id: 6,
    seller: SELLER_A,
    name: 'Chemistry Lab Coat + Goggles',
    priceEth: 0.005,
    isSold: true,
    isCancelled: false,
    buyer: SELLER_B,
  },
]

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function fakeTxHash() {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

// Simulates waiting for a transaction to be mined
export function simulateTx(ms = 1500) {
  return new Promise<string>((resolve) => {
    setTimeout(() => resolve(fakeTxHash()), ms)
  })
}
