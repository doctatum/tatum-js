import { BlockchainTestData } from '../shared-testing'

export const BTC_TEST_DATA: BlockchainTestData = {
  MAINNET: {
    XPUB: 'xpub6EvgPCG9vgxentW9pgd7iGUxMchXgvmhDTBdw9oPAT5ye4ZgVfR2kAoppb7PBuktykWwADKef4qGRSzTpF97Z9nrPmLwgVZjPNebKXDwyF1',
    XPUB_REGEX: /xpub6/,
    ADDRESS_0: 'bc1quupgrqhldzhyjwygpnuefgw50kxxrqxwpfqvna',
    ADDRESS_100: 'bc1qt9uat2hmq76fs37vrz4t936g5smgfg57hlpkts',
    PRIVATE_KEY_0: 'L27j51mbxeWksCcWLUxUT7MhP4iQWDRsb72seDKNo6yERKPr3vtj',
    PRIVATE_KEY_100: 'L4YQbJRRzULqB2jnk2CbCgGnLMen8DJaQjiqzYw4qyucWM5cbBnQ',
  },
  TESTNET: {
    XPUB: 'tpubDEKXb45q3i1tKQdUsCmG1BfNTHbztHT73q8hCBz6PN93zCKUppXiUsqEW38jvSQzgvYjMzPSGYjH7TPKkjZc5wTHTPSJs2NBJpd4mbos5ZZ',
    XPUB_REGEX: /tpub/,
    ADDRESS_0: 'tb1q3r6kjwhpd739mxve6avumzq9hmfvrv0kd475jw',
    ADDRESS_100: 'tb1qv377aqf0u2lyc6n8av3nk2a6sf5tsu8l22w26e',
    PRIVATE_KEY_0: 'cNqC7k1rcoLpWeC4t8UTJHUmm9nuNmeJZ2GAuFWirih2RLD8DuMd',
    PRIVATE_KEY_100: 'cPE42nXJCYf5XdHgWB8ZW6CdCRo1VuFwoKwpHNNxLFQcaDC69QkV',
  },
  BLOCK_HASH: '0000000017cb55f6f5afd2d2f3ac72209edc502442879c59bf79abdc39e3a3ff',
  BLOCK_HEIGHT: 2106672,
  TX_HASH: '5a3a323f55d79cbd643160b237a6f69b3d0268617a84e8acc30812df87498361',
  INVALID_XPUB_ERROR: 'Non-base58 character',
  INVALID_XPUB_CHILD_INDEX_ERROR: 'Expected BIP32Path, got String "-1"',
  INVALID_PRIVATE_KEY_CHILD_INDEX_ERROR: 'Expected UInt32, got Number -1',
  INVALID_PRIVATE_KEY_ERROR: 'Non-base58 character',
}
