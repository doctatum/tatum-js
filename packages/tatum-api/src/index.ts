import {
  BlockchainAdaService,
  BlockchainAlgorandAlgoService,
  BlockchainBinanceService,
  BlockchainBitcoinCashService,
  BlockchainBitcoinService,
  BlockchainBscService,
  BlockchainCeloService,
  BlockchainDogecoinService,
  BlockchainElrondNetworkEgldService,
  BlockchainEthereumService,
  BlockchainFabricService,
  BlockchainFlowService,
  BlockchainFungibleTokenService,
  BlockchainHarmonyOneService,
  BlockchainKcsKcsService,
  BlockchainLitecoinService,
  BlockchainMarketplaceService,
  BlockchainMultiTokenErc1155Service,
  BlockchainNeoService,
  BlockchainNftService,
  BlockchainPolygonMaticService,
  BlockchainQtumService,
  BlockchainQuorumService,
  BlockchainRecordService,
  BlockchainScryptaService,
  BlockchainSolanaService,
  BlockchainTronService,
  BlockchainUtilsService,
  BlockchainVeChainService,
  BlockchainXdcNetworkXinFinService,
  BlockchainXlmService,
  BlockchainXrpService,
  LedgerAccountService,
  LedgerCustomerService,
  LedgerOrderBookService,
  LedgerSubscriptionService,
  LedgerTransactionService,
  LedgerVirtualCurrencyService,
  OffChainAccountService,
  OffChainBlockchainService,
  OffChainWithdrawalService,
  OpenAPI,
  SecurityAddressService,
  SecurityKeyManagementSystemService,
  StorageIpfsService,
  TatumServiceService,
} from './generated'

export * from './generated'

export function TatumApi(apiKey: string, url = 'https://api-eu1.tatum.io') {
  OpenAPI.HEADERS = { 'X-API-Key': apiKey }
  OpenAPI.BASE = url

  return {
    blockchain: {
      ada: BlockchainAdaService,
      algo: BlockchainAlgorandAlgoService,
      bnb: BlockchainBinanceService,
      bitcoin: BlockchainBitcoinService,
      bcash: BlockchainBitcoinCashService,
      bsc: BlockchainBscService,
      celo: BlockchainCeloService,
      doge: BlockchainDogecoinService,
      elgo: BlockchainElrondNetworkEgldService,
      eth: BlockchainEthereumService,
      fabric: BlockchainFabricService,
      flow: BlockchainFlowService,
      one: BlockchainHarmonyOneService,
      kcs: BlockchainKcsKcsService,
      ltc: BlockchainLitecoinService,
      neo: BlockchainNeoService,
      polygon: BlockchainPolygonMaticService,
      qtum: BlockchainQtumService,
      quorum: BlockchainQuorumService,
      scrypta: BlockchainScryptaService,
      solana: BlockchainSolanaService,
      tron: BlockchainTronService,
      utils: BlockchainUtilsService,
      vechain: BlockchainVeChainService,
      xdc: BlockchainXdcNetworkXinFinService,
      xlm: BlockchainXlmService,
      xrp: BlockchainXrpService,
    },
    ipfs: StorageIpfsService,
    fungibleToken: BlockchainFungibleTokenService,
    marketplace: BlockchainMarketplaceService,
    multiToken: BlockchainMultiTokenErc1155Service,
    nft: BlockchainNftService,
    record: BlockchainRecordService,
    ledger: {
      account: LedgerAccountService,
      customer: LedgerCustomerService,
      orderBook: LedgerOrderBookService,
      subscriptions: LedgerSubscriptionService,
      transaction: LedgerTransactionService,
      virtualCurrency: LedgerVirtualCurrencyService,
    },
    offChain: {
      account: OffChainAccountService,
      blockchain: OffChainBlockchainService,
      withdrawal: OffChainWithdrawalService,
    },
    security: SecurityAddressService,
    kms: SecurityKeyManagementSystemService,
    tatum: TatumServiceService,
  }
}
