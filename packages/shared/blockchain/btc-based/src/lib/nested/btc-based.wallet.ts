import { BtcBasedWalletUtils } from '../btc-based.wallet.utils'
import { Wallet } from '@tatumio/api-client'
import { BtcBasedBlockchain } from '@tatumio/shared-core'

export const btcBasedWallet = (args: { blockchain: BtcBasedBlockchain; utils: BtcBasedWalletUtils }) => {
  return {
    /**
     * Generate address
     * @param xpub extended public key to generate address from
     * @param i derivation index of address to generate. Up to 2^31 addresses can be generated.
     * @param options optional testnet or mainnet version of address. Default: false
     * @returns blockchain address
     */
    generateAddressFromXPub(xpub: string, i: number, options?: { testnet: boolean }): string {
      return args.utils.generateAddressFromXPub(xpub, i, options)
    },

    /**
     * Generate private key from mnemonic seed
     * @param mnemonic mnemonic to generate private key from
     * @param i derivation index of private key to generate.
     * @param options optional testnet or mainnet version of address. Default: false
     * @returns blockchain private key to the address
     */
    async generatePrivateKeyFromMnemonic(
      mnemonic: string,
      i: number,
      options?: { testnet: boolean },
    ): Promise<string> {
      return args.utils.generatePrivateKeyFromMnemonic(mnemonic, i, options)
    },

    /**
     * Generate address from private key
     * @param privateKey private key to use
     * @param options optional testnet or mainnet version of address. Default: false
     * @returns blockchain private key to the address
     */
    generateAddressFromPrivateKey(privateKey: string, options?: { testnet: boolean }): string {
      return args.utils.generateAddressFromPrivateKey(privateKey, options)
    },

    /**
     * Generate wallet
     * @param mnemonic mnemonic seed to use. If not present, new one will be generated
     * @param options optional testnet or mainnet version of address. Default: false
     * @returns wallet or a combination of address and private key
     */
    async generateWallet(mnemonic?: string, options?: { testnet: boolean }): Promise<Wallet> {
      return args.utils.generateBlockchainWallet(mnemonic, options)
    },
  }
}
