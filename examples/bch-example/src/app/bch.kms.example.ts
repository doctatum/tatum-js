import { TatumBchSDK } from '@tatumio/bch'
import { REPLACE_ME_WITH_TATUM_API_KEY } from '@tatumio/shared-testing'

const bchSDK = TatumBchSDK({ apiKey: REPLACE_ME_WITH_TATUM_API_KEY })

export async function bchKmsExample() {
  const pendingSignatureIds = await bchSDK.kms.getAllPending()
  const tx = await bchSDK.kms.get(pendingSignatureIds.id)
  const signedRawTx = await bchSDK.kms.sign(pendingSignatureIds, [
    'L3Jf3gvX1YaCJJTejTfghZ4Sst8GSui6UQctERksAimYCskVH7iG',
  ])
  await bchSDK.kms.complete(pendingSignatureIds.id, pendingSignatureIds.txId!)
  await bchSDK.kms.delete(pendingSignatureIds.id)
}
