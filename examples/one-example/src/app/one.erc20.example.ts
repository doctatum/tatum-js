import { TatumOneSDK } from '@tatumio/one'
import { Currency, TransactionHash } from '@tatumio/api-client'
import { sleepSeconds } from '@tatumio/shared-abstract-sdk'

const SLEEP_SECONDS = 20
const oneSDK = TatumOneSDK({ apiKey: '75ea3138-d0a1-47df-932e-acb3ee807dab' })

/**
 * In order for these examples to work you need to fund your address and use the address & private key combination that has coins
 * Fund your address here: https://faucet.pops.one/
 */
export async function oneErc20Example() {
  // This address wil DEPLOY, MINT and TRANSFER ERC20 to Receiver Address
  const senderAddress = '<PUT SENDER ADDRESS HERE>'
  const senderPrivateKey = '<PUT SENDER PRIVATE KEY HERE>'

  // This address will RECEIVE ERC20 token and BURN it
  const receiverAddress = '<PUT RECEIVER ADDRESS HERE>'
  const receiverPrivateKey = '<PUT RECEIVER PRIVATE KEY HERE>'

  // deploy erc20 (fungible token) transaction
  // https://apidoc.tatum.io/tag/Fungible-Tokens-(ERC-20-or-compatible)#operation/Erc20Deploy
  const erc20Deployed = (await oneSDK.erc20.send.deploySignedTransaction({
    symbol: 'ERC_SYMBOL',
    name: 'mytx',
    address: senderAddress,
    supply: '0',
    fromPrivateKey: senderPrivateKey,
    digits: 18,
    totalCap: '10000000',
  })) as TransactionHash

  console.log(`Deployed erc20 token with txID ${erc20Deployed.txId}`)

  // If during this time the transaction is not confirmed, then the waiting time should be increased.
  // In a real application, the wait mechanism must be implemented properly without using this
  console.log(
    `Waiting ${SLEEP_SECONDS} seconds for the transaction [${erc20Deployed.txId}] to appear in a block`,
  )
  await sleepSeconds(SLEEP_SECONDS)

  // fetch deployed contract address from transaction hash
  // https://apidoc.tatum.io/tag/Blockchain-utils#operation/SCGetContractAddress
  const transaction = await oneSDK.blockchain.smartContractGetAddress(Currency.ONE, erc20Deployed.txId)
  const contractAddress = transaction.contractAddress as string

  const erc20Minted = (await oneSDK.erc20.send.mintSignedTransaction({
    to: senderAddress,
    amount: '10',
    contractAddress,
    fromPrivateKey: senderPrivateKey,
  })) as TransactionHash

  console.log(`Minted erc20 token/s with txID ${erc20Minted.txId}`)

  console.log(
    `Waiting ${SLEEP_SECONDS} seconds for the transaction [${erc20Minted.txId}] to appear in a block`,
  )
  await sleepSeconds(SLEEP_SECONDS)

  // send erc20 (fungible token) transaction
  const erc20Transferred = (await oneSDK.erc20.send.transferSignedTransaction({
    to: receiverAddress,
    amount: '1',
    contractAddress,
    fromPrivateKey: senderPrivateKey,
    digits: 18,
  })) as TransactionHash

  console.log(`Erc20 transaction with txID ${erc20Transferred.txId} was sent.`)
  console.log(
    `Waiting ${SLEEP_SECONDS} seconds for the transaction [${erc20Transferred.txId}] to appear in a block`,
  )
  await sleepSeconds(SLEEP_SECONDS)

  // burn erc20 (fungible token) transaction
  const erc20Burned = (await oneSDK.erc20.send.burnSignedTransaction({
    amount: '1',
    contractAddress,
    fromPrivateKey: receiverPrivateKey,
  })) as TransactionHash

  console.log(`Burned erc20 token/s with transaction ID ${erc20Burned.txId}`)
}
