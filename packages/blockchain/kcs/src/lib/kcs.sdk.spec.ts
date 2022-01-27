import {
  erc20TestFactory,
  REPLACE_ME_WITH_TATUM_API_KEY,
  TEST_DATA,
  walletTestFactory,
} from '@tatumio/shared-testing'
import { TatumKcsSDK } from './kcs.sdk'

describe('TatumKcsSDK', () => {
  const sdk = TatumKcsSDK({ apiKey: REPLACE_ME_WITH_TATUM_API_KEY })

  describe('Wallet', () => {
    describe('Generate wallet', () => {
      walletTestFactory.generateBlockchainWallet(sdk.wallet, TEST_DATA.KCS)
    })

    describe('Address from XPUB', () => {
      walletTestFactory.generateAddressFromXpub(sdk.wallet, TEST_DATA.KCS)
    })

    describe('Private key from mnemonic', () => {
      walletTestFactory.generatePrivateKeyFromMnemonic(sdk.wallet, TEST_DATA.KCS)
    })

    describe('Address from private key', () => {
      walletTestFactory.generateAddressFromPrivateKey(sdk.wallet, TEST_DATA.KCS)
    })
  })

  describe('erc20', () => {
    describe('decimals', () => {
      erc20TestFactory.decimals(sdk.transaction.erc20, TEST_DATA.KCS)
    })

    describe('prepare', () => {
      describe('deploySignedTransaction', () => {
        erc20TestFactory.prepare.deploySignedTransaction(sdk.transaction.erc20, TEST_DATA.KCS)
      })

      describe('transferSignedTransaction', () => {
        erc20TestFactory.prepare.transferSignedTransaction(sdk.transaction.erc20, TEST_DATA.KCS)
      })

      describe('mintSignedTransaction', () => {
        erc20TestFactory.prepare.mintSignedTransaction(sdk.transaction.erc20, TEST_DATA.KCS)
      })

      describe('burnSignedTransaction', () => {
        erc20TestFactory.prepare.burnSignedTransaction(sdk.transaction.erc20, TEST_DATA.KCS)
      })
    })
  })
})
