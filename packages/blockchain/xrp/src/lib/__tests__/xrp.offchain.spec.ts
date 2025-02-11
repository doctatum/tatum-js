import '@tatumio/shared-testing-common'
import { xrpVirtualAccountService } from '../services/xrp.virtualAccount'
import { mockHelper, testHelper } from '@tatumio/shared-testing-common'
import * as apiClient from '@tatumio/api-client'
import { Currency, XrpAccount } from '@tatumio/api-client'
import { Blockchain } from '@tatumio/shared-core'
import { SdkErrorCode } from '@tatumio/shared-abstract-sdk'

jest.mock('@tatumio/api-client')
const mockedApi = mockHelper.mockApi(apiClient)

describe('XrpSDK - virtual account', () => {
  const virtualAccountService = xrpVirtualAccountService({ blockchain: Blockchain.XRP })

  const SECRET = 'shunwft7BwrFHdcXmAA87CazLsRMY'
  const ACCOUNT = 'rKHuaCVSzJCFh43ji9EvFAysmu1KHdMb8N'
  const FEE = '0.00001'
  const AMOUNT = '1'
  const VALID_TX_DATA =
    '1200002280000000240000007B201B000000066140000000000F424068400000000000000A732102A6736884D857E721F19B91226FBA68D638009FA44B14CD46C63CC30253C8715C74473045022100F57CE43BE920FCE2DD5B8E03F1A64A9F6E46D68A37EE13BDE0B193E12635DF94022018740EED96BB501ACC1090AD722CED4C38E388DF1705EDC5A47558F59C7343D88114C8A4688E754167637D0E2C00F14C7E15AAFDA42C8314C8A4688E754167637D0E2C00F14C7E15AAFDA42C'

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('send virtual account transaction', () => {
    it('valid', async () => {
      mockGetAccountInfo()

      mockedApi.virtualAccount.withdrawal.broadcastBlockchainTransaction.mockResolvedValue({ txId: '1234' })
      mockedApi.virtualAccount.withdrawal.storeWithdrawal.mockResolvedValue({ id: '1' })

      const result = await virtualAccountService.sendTransactionFromVirtualAccountToBlockchain({
        senderAccountId: ACCOUNT,
        account: ACCOUNT,
        address: ACCOUNT,
        amount: AMOUNT,
        secret: SECRET,
        fee: FEE,
      })

      expect(result.txId).toBe('1234')
      testHelper.expectMockCalled(mockedApi.virtualAccount.withdrawal.broadcastBlockchainTransaction, [
        { txData: VALID_TX_DATA, withdrawalId: '1', currency: Currency.XRP },
      ])
    })

    it('!fee', async () => {
      mockGetAccountInfo()

      await expect(
        virtualAccountService.sendTransactionFromVirtualAccountToBlockchain({
          senderAccountId: ACCOUNT,
          account: ACCOUNT,
          address: ACCOUNT,
          amount: AMOUNT,
          secret: SECRET,
          fee: null,
        }),
      ).rejects.toThrowSdkErrorWithCode(SdkErrorCode.FEE_TOO_SMALL)
    })

    it('fee = 0', async () => {
      mockGetAccountInfo()

      await expect(
        virtualAccountService.sendTransactionFromVirtualAccountToBlockchain({
          senderAccountId: ACCOUNT,
          account: ACCOUNT,
          address: ACCOUNT,
          amount: AMOUNT,
          secret: SECRET,
          fee: '0',
        }),
      ).rejects.toThrowSdkErrorWithCode(SdkErrorCode.FEE_TOO_SMALL)
    })
  })

  function mockGetAccountInfo(
    args: XrpAccount = {
      ledger_current_index: 1,
      account_data: { Sequence: 123 },
    },
  ) {
    mockedApi.blockchain.xrp.xrpGetAccountInfo.mockResolvedValue(args)
  }
})
