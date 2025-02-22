import { BlockchainTestData } from '../shared-testing'
import { ETH_TEST_DATA } from './eth.test-data'

export const KCS_TEST_DATA: BlockchainTestData = {
  ...ETH_TEST_DATA,
  PROVIDER: 'https://rpc-testnet.kcc.network',
  MAINNET: {
    ...ETH_TEST_DATA.MAINNET,
    XPUB: 'xpub6EmVHAqPHkSRgsS7Km6Ynmjg4Kup6aD2NjX1zmVEwuwvJZPGefgmmg5a36eBX8QZpfhtPu7qHgcMmehDMLivrm8gY2L7v8iQDmxyYVhxPUs',
    PRIVATE_KEY_0: '0x1612736ca819d2c5907a07d4e4dfb91dd5a8b3691079289afaee824ddcfdf495',
    PRIVATE_KEY_100: '0x01c0a301a5387999ecd48f05c2485f895463332e503db22ac09361bae6af4dd5',
    ADDRESS_0: '0xb9e379f99ca17a5009471bd2e8194123ec9eb497',
    ADDRESS_100: '0xc6776c6230adf9216646da8f68c9863493cf81df',
  },
  BLOCK_HASH: '0xbf1d59d3e95aa8f03138588a0c5d211ae91a7e00273580df6c17b432b2adff67',
  BLOCK_HEIGHT: 7_009_962,
  TX_HASH: '0x43b35eee3ef3efb975a14625a893ed4b4ec39365e2927cddc0fe8003b5b9f012',
  TESTNET: {
    ...ETH_TEST_DATA.TESTNET,
    ERC_20: {
      CONTRACT_ADDRESS: '0x0b9808fce74030c87aae334a30f6c8f6c66b090d',
      PRIVATE_KEY: '0x1a4344e55c562db08700dd32e52e62e7c40b1ef5e27c6ddd969de9891a899b29',
      ADDRESS: '0x811DfbFF13ADFBC3Cf653dCc373C03616D3471c9',
    },
    MULTITOKEN: {
      CONTRACT_ADDRESS: '0xe2a8d7c5b2b4acad7e5b9aec0998cdbbeed45e49',
      PRIVATE_KEY: '0x1a4344e55c562db08700dd32e52e62e7c40b1ef5e27c6ddd969de9891a899b29',
      ADDRESS: '0x4b812a77b109A150C2Fc89eD133EaBC78bC9EC8f',
    },
    SMART_CONTRACT: {
      CONTRACT_ADDRESS: '0x0b9808fce74030c87aae334a30f6c8f6c66b090d',
      PRIVATE_KEY: '0x1a4344e55c562db08700dd32e52e62e7c40b1ef5e27c6ddd969de9891a899b29',
    },
    ERC_721: {
      PRIVATE_KEY: '0d6c13fe5fed644dfa02512d4bffde9453dcb48873afb0b0a4c0cebce160c279',
      CONTRACT_ADDRESS: '0x2A42ae2a6346eEbC7FE2b2b7f02158634d5390dc',
    },
    SERIALIZED_TX:
      '{"from":0,"to":"0x687422eEA2cB73B5d3e242bA5456b782919AFc85","data":"0x731133e9000000000000000000000000687422eea2cb73b5d3e242ba5456b782919afc8500000000000000000000000000000000000000000000000000000000000186a000000000000000000000000000000000000000000000000000000000000186a0000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000","nonce":58604750,"gasPrice":"20000000000"}',
    PROVIDER: 'https://rpc-testnet.kcc.network',
  },
}
