import { ethers } from 'ethers'

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const formatWeiBalance = (balance?: bigint, decimals: number = 4) => {
  if (!balance) return "00.00"
  const balanceInEth = ethers.formatEther(balance)
  return Number(balanceInEth).toFixed(decimals)
}

export const ethToWei = (amount: string) => {
  return ethers.parseEther(amount).toString()
}
