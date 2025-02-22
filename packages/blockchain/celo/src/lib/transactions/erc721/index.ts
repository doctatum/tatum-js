import { Blockchain, EvmBasedBlockchain } from '@tatumio/shared-core'
import BigNumber from 'bignumber.js'
import {
  ApiServices,
  BurnNftKMSCelo,
  DeployNftCeloKMS,
  MintMultipleNftKMSCelo,
  MintNftKMSCelo,
  TransferNftKMSCelo,
  UpdateCashbackValueForAuthorNftKMSCelo,
} from '@tatumio/api-client'
import {
  Erc721_Provenance,
  Erc721Token_Cashback,
  Erc721Token_General,
  EvmBasedSdkError,
  evmBasedUtils,
} from '@tatumio/shared-blockchain-evm-based'
import { BroadcastFunction } from '@tatumio/shared-blockchain-abstract'
import { CeloWallet } from '@celo-tools/celo-ethers-wrapper'
import {
  CeloTransactionConfig,
  celoUtils,
  ChainAddMinterErc721Celo,
  ChainBurnErc721Celo,
  ChainDeployErc721Celo,
  ChainMintMultipleNftCelo,
  ChainMintNftCelo,
  ChainTransferErc721Celo,
  ChainUpdateCashbackErc721Celo,
} from '../../utils/celo.utils'
import Web3 from 'web3'
import { SdkErrorCode } from '@tatumio/shared-abstract-sdk'

const deploySignedTransaction = async (body: ChainDeployErc721Celo, provider?: string, testnet?: boolean) => {
  const {
    fromPrivateKey,
    name,
    symbol,
    feeCurrency,
    fee,
    nonce,
    signatureId,
    cashback,
    provenance,
    publicMint,
  } = body

  if (provenance && cashback) {
    throw new Error('Only one of provenance or cashback must be present and true.')
  }

  const celoProvider = celoUtils.getProvider(provider)
  const network = await celoProvider.ready
  const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)

  let abi = Erc721Token_General.abi
  let deployData = Erc721Token_General.bytecode
  if (body.provenance) {
    abi = Erc721_Provenance.abi
    deployData = Erc721_Provenance.bytecode
  } else if (body.cashback) {
    abi = Erc721Token_Cashback.abi
    deployData = Erc721Token_Cashback.bytecode
  }

  const contract = new new Web3().eth.Contract(abi as any)
  const deploy = contract.deploy({
    data: deployData,
    arguments: [name, symbol, publicMint ?? false],
  })

  if (signatureId) {
    return JSON.stringify({
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
      data: deploy.encodeABI(),
    })
  }

  const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
  const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
    wallet,
    feeCurrencyContractAddress,
  )

  const tx: CeloTransactionConfig = {
    chainId: network.chainId,
    feeCurrency: feeCurrencyContractAddress,
    nonce: nonce || txCount,
    gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
    gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
    data: deploy.encodeABI(),
    from,
  }

  return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
}

const mintSignedTransaction = async (body: ChainMintNftCelo, provider?: string, testnet?: boolean) => {
  const { contractAddress, nonce, signatureId, feeCurrency, to, tokenId, url, fee, fromPrivateKey } = body

  const celoProvider = celoUtils.getProvider(provider)
  const network = await celoProvider.ready

  if (contractAddress && feeCurrency) {
    const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)
    const contract = new new Web3().eth.Contract(Erc721Token_Cashback.abi as any, contractAddress.trim())

    if (signatureId) {
      return JSON.stringify({
        chainId: network.chainId,
        feeCurrency: feeCurrencyContractAddress,
        nonce,
        to: contractAddress.trim(),
        gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
        gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
        data: contract.methods.mintWithTokenURI(to.trim(), tokenId, url).encodeABI(),
      })
    }

    const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
    const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
      wallet,
      feeCurrencyContractAddress,
    )

    const tx: CeloTransactionConfig = {
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      to: contractAddress.trim(),
      data: contract.methods.mintWithTokenURI(to.trim(), tokenId, url).encodeABI(),
      nonce: nonce || txCount,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
      from,
    }

    return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
  }
  throw new EvmBasedSdkError({ code: SdkErrorCode.CELO_MISSING_CONTRACT_ADDRESS })
}

const mintMultipleSignedTransaction = async (
  body: ChainMintMultipleNftCelo,
  provider?: string,
  testnet?: boolean,
) => {
  const { fromPrivateKey, to, tokenId, contractAddress, url, feeCurrency, fee, nonce, signatureId } = body

  const celoProvider = celoUtils.getProvider(provider)
  const network = await celoProvider.ready

  if (contractAddress && feeCurrency) {
    const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)
    const contract = new new Web3().eth.Contract(Erc721Token_Cashback.abi as any, contractAddress.trim())

    if (signatureId) {
      return JSON.stringify({
        chainId: network.chainId,
        feeCurrency: feeCurrencyContractAddress,
        nonce,
        gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
        gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
        to: contractAddress.trim(),
        data: contract.methods
          .mintMultiple(
            to.map((t) => t.trim()),
            tokenId,
            url,
          )
          .encodeABI(),
      })
    }

    const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
    const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
      wallet,
      feeCurrencyContractAddress,
    )

    const tx: CeloTransactionConfig = {
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce: nonce || txCount,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
      to: contractAddress.trim(),
      data: contract.methods
        .mintMultiple(
          to.map((t) => t.trim()),
          tokenId,
          url,
        )
        .encodeABI(),
      from,
    }

    return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
  }
  throw new EvmBasedSdkError({ code: SdkErrorCode.CELO_MISSING_CONTRACT_ADDRESS })
}

const mintCashbackSignedTransaction = async (
  body: ChainMintNftCelo,
  provider?: string,
  testnet?: boolean,
) => {
  const {
    fromPrivateKey,
    url,
    to,
    tokenId,
    contractAddress,
    feeCurrency,
    fee,
    nonce,
    signatureId,
    authorAddresses,
    cashbackValues,
    erc20,
  } = body

  const celoProvider = celoUtils.getProvider(provider)
  const network = await celoProvider.ready

  if (contractAddress && feeCurrency) {
    const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)
    const contract = new new Web3().eth.Contract(Erc721Token_Cashback.abi as any, contractAddress.trim())
    const cb: string[] = []
    for (const c of cashbackValues!) {
      cb.push(`0x${new BigNumber(Web3.utils.toWei(c, 'ether')).toString(16)}`)
    }

    if (signatureId) {
      return JSON.stringify({
        chainId: network.chainId,
        feeCurrency: feeCurrencyContractAddress,
        nonce,
        to: contractAddress.trim(),
        gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
        gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
        data: erc20
          ? contract.methods.mintWithCashback(to.trim(), tokenId, url, authorAddresses, cb, erc20).encodeABI()
          : contract.methods.mintWithCashback(to.trim(), tokenId, url, authorAddresses, cb).encodeABI(),
      })
    }

    const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
    const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
      wallet,
      feeCurrencyContractAddress,
    )

    const tx: CeloTransactionConfig = {
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce: nonce || txCount,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
      to: contractAddress.trim(),
      data: erc20
        ? contract.methods.mintWithCashback(to.trim(), tokenId, url, authorAddresses, cb, erc20).encodeABI()
        : contract.methods.mintWithCashback(to.trim(), tokenId, url, authorAddresses, cb).encodeABI(),
      from,
    }

    return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
  }
  throw new EvmBasedSdkError({ code: SdkErrorCode.CELO_MISSING_CONTRACT_ADDRESS })
}

export const mintMultipleCashbackSignedTransaction = async (
  body: ChainMintMultipleNftCelo,
  provider?: string,
  testnet?: boolean,
) => {
  const {
    fromPrivateKey,
    to,
    tokenId,
    contractAddress,
    url,
    feeCurrency,
    fee,
    nonce,
    signatureId,
    authorAddresses,
    cashbackValues,
    erc20,
  } = body
  if (contractAddress && feeCurrency) {
    const celoProvider = celoUtils.getProvider(provider)
    const network = await celoProvider.ready
    const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)
    const contract = new new Web3().eth.Contract(Erc721Token_Cashback.abi as any, contractAddress.trim())

    const cashbacks: string[][] = cashbackValues!
    const cb: string[][] = []

    for (const c of cashbacks) {
      const cb2: string[] = []
      for (const c2 of c) {
        cb2.push(`0x${new BigNumber(Web3.utils.toWei(c2, 'ether')).toString(16)}`)
      }
      cb.push(cb2)
    }

    if (signatureId) {
      return JSON.stringify({
        chainId: network.chainId,
        feeCurrency: feeCurrencyContractAddress,
        nonce,
        gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
        gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
        to: contractAddress.trim(),
        data: erc20
          ? contract.methods
              .mintMultipleCashback(
                to.map((t) => t.trim()),
                tokenId,
                url,
                authorAddresses,
                cb,
                erc20,
              )
              .encodeABI()
          : contract.methods
              .mintMultipleCashback(
                to.map((t) => t.trim()),
                tokenId,
                url,
                authorAddresses,
                cb,
              )
              .encodeABI(),
      })
    }

    const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
    const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
      wallet,
      feeCurrencyContractAddress,
    )

    const tx: CeloTransactionConfig = {
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce: nonce || txCount,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
      to: contractAddress.trim(),
      data: erc20
        ? contract.methods
            .mintMultipleCashback(
              to.map((t) => t.trim()),
              tokenId,
              url,
              authorAddresses,
              cb,
              erc20,
            )
            .encodeABI()
        : contract.methods
            .mintMultipleCashback(
              to.map((t) => t.trim()),
              tokenId,
              url,
              authorAddresses,
              cb,
            )
            .encodeABI(),
      from,
    }
    return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
  }
  throw new EvmBasedSdkError({ code: SdkErrorCode.CELO_MISSING_CONTRACT_ADDRESS })
}

const mintProvenanceSignedTransaction = async (
  body: ChainMintNftCelo,
  provider?: string,
  testnet?: boolean,
) => {
  const {
    fromPrivateKey,
    url,
    to,
    tokenId,
    contractAddress,
    feeCurrency,
    fee,
    nonce,
    signatureId,
    cashbackValues,
    authorAddresses,
    fixedValues,
    erc20,
  } = body

  const celoProvider = celoUtils.getProvider(provider)
  const network = await celoProvider.ready

  if (contractAddress && feeCurrency) {
    const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)

    const contract = new new Web3().eth.Contract(Erc721_Provenance.abi as any, contractAddress.trim())
    const cb: string[] = []
    const fv: string[] = []
    if (cashbackValues && fixedValues && authorAddresses) {
      cashbackValues.forEach((c) => cb.push(`0x${new BigNumber(c).multipliedBy(100).toString(16)}`))
      fixedValues.forEach((c) => fv.push(`0x${new BigNumber(Web3.utils.toWei(c, 'ether')).toString(16)}`))
    }
    const data = erc20
      ? contract.methods
          .mintWithTokenURI(to.trim(), tokenId, url, authorAddresses ? authorAddresses : [], cb, fv, erc20)
          .encodeABI()
      : contract.methods
          .mintWithTokenURI(to.trim(), tokenId, url, authorAddresses ? authorAddresses : [], cb, fv)
          .encodeABI()

    if (signatureId) {
      return JSON.stringify({
        chainId: network.chainId,
        feeCurrency: feeCurrencyContractAddress,
        nonce,
        to: contractAddress.trim(),
        gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
        gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
        data: data,
      })
    }

    const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
    const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
      wallet,
      feeCurrencyContractAddress,
    )

    const tx: CeloTransactionConfig = {
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce: nonce || txCount,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
      to: contractAddress.trim(),
      data: data,
      from,
    }

    return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
  }
  throw new EvmBasedSdkError({ code: SdkErrorCode.CELO_MISSING_CONTRACT_ADDRESS })
}

const mintMultipleProvenanceSignedTransaction = async (
  body: ChainMintMultipleNftCelo & { fixedValues: string[][] },
  provider?: string,
  testnet?: boolean,
) => {
  const {
    fromPrivateKey,
    to,
    tokenId,
    contractAddress,
    url,
    feeCurrency,
    fee,
    nonce,
    signatureId,
    authorAddresses,
    cashbackValues,
    fixedValues,
    erc20,
  } = body
  if (contractAddress && feeCurrency) {
    const celoProvider = celoUtils.getProvider(provider)
    const network = await celoProvider.ready
    const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)
    const contract = new new Web3().eth.Contract(Erc721_Provenance.abi as any, contractAddress.trim())

    const cb: string[][] = []
    const fv: string[][] = []
    if (authorAddresses && cashbackValues && fixedValues) {
      for (let i = 0; i < cashbackValues.length; i++) {
        const cb2: string[] = []
        const fv2: string[] = []
        for (let j = 0; j < cashbackValues[i].length; j++) {
          cb2.push(`0x${new BigNumber(cashbackValues[i][j]).multipliedBy(100).toString(16)}`)
          fv2.push(`0x${new BigNumber(Web3.utils.toWei(fixedValues[i][j], 'ether')).toString(16)}`)
        }
        cb.push(cb2)
        fv.push(fv2)
      }
    }
    const data = erc20
      ? contract.methods
          .mintMultiple(
            to.map((t) => t.trim()),
            tokenId,
            url,
            authorAddresses ? authorAddresses : [],
            cb,
            fv,
            erc20,
          )
          .encodeABI()
      : contract.methods
          .mintMultiple(
            to.map((t) => t.trim()),
            tokenId,
            url,
            authorAddresses ? authorAddresses : [],
            cb,
            fv,
          )
          .encodeABI()

    if (signatureId) {
      return JSON.stringify({
        chainId: network.chainId,
        feeCurrency: feeCurrencyContractAddress,
        nonce,
        gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
        gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
        to: contractAddress.trim(),
        data: data,
      })
    }

    const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
    const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
      wallet,
      feeCurrencyContractAddress,
    )

    const tx: CeloTransactionConfig = {
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce: nonce || txCount,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
      to: contractAddress.trim(),
      data: data,
      from,
    }
    return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
  }
  throw new EvmBasedSdkError({ code: SdkErrorCode.CELO_MISSING_CONTRACT_ADDRESS })
}

const addMinterSignedTransaction = async (
  body: ChainAddMinterErc721Celo,
  provider?: string,
  testnet?: boolean,
) => {
  const { fromPrivateKey, minter, contractAddress, feeCurrency, fee, nonce, signatureId } = body

  const celoProvider = celoUtils.getProvider(provider)
  const network = await celoProvider.ready
  const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)
  const contract = new new Web3().eth.Contract(Erc721Token_General.abi as any, contractAddress.trim())

  if (signatureId) {
    return JSON.stringify({
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
      to: contractAddress.trim(),
      data: contract.methods
        .grantRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', minter.trim())
        .encodeABI(),
    })
  }

  const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
  const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
    wallet,
    feeCurrencyContractAddress,
  )

  const tx: CeloTransactionConfig = {
    chainId: network.chainId,
    feeCurrency: feeCurrencyContractAddress,
    nonce: nonce || txCount,
    gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
    gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
    to: contractAddress.trim(),
    data: contract.methods
      .grantRole('0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', minter)
      .encodeABI(),
    from,
  }
  return celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
}

const transferSignedTransaction = async (
  body: ChainTransferErc721Celo,
  provider?: string,
  testnet?: boolean,
) => {
  const {
    fromPrivateKey,
    to,
    tokenId,
    contractAddress,
    feeCurrency,
    fee,
    nonce,
    signatureId,
    value,
    provenance,
    provenanceData,
    tokenPrice,
  } = body
  if (contractAddress && feeCurrency) {
    const celoProvider = celoUtils.getProvider(provider)
    const network = await celoProvider.ready
    const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)
    const contract = new new Web3().eth.Contract(
      provenance ? Erc721_Provenance.abi : (Erc721Token_Cashback.abi as any),
      contractAddress.trim(),
    )
    const dataBytes = provenance
      ? Buffer.from(provenanceData + "'''###'''" + Web3.utils.toWei(tokenPrice!, 'ether'), 'utf8')
      : ''
    const tokenData = provenance
      ? contract.methods.safeTransfer(to.trim(), tokenId, `0x${dataBytes.toString('hex')}`).encodeABI()
      : contract.methods.safeTransfer(to.trim(), tokenId).encodeABI()

    if (signatureId) {
      return JSON.stringify({
        chainId: network.chainId,
        feeCurrency: feeCurrencyContractAddress,
        gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
        gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
        nonce,
        to: contractAddress.trim(),
        data: tokenData,
        value: value ? `0x${new BigNumber(value).multipliedBy(1e18).toString(16)}` : undefined,
      })
    }

    const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
    const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
      wallet,
      feeCurrencyContractAddress,
    )

    const tx: CeloTransactionConfig = {
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce: nonce || txCount,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
      to: contractAddress.trim(),
      data: tokenData,
      from,
      value: value ? `0x${new BigNumber(value).multipliedBy(1e18).toString(16)}` : undefined,
    }
    return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
  }
  throw new EvmBasedSdkError({ code: SdkErrorCode.CELO_MISSING_CONTRACT_ADDRESS })
}

const updateCashbackForAuthorSignedTransaction = async (
  body: ChainUpdateCashbackErc721Celo,
  provider?: string,
  testnet?: boolean,
) => {
  const { fromPrivateKey, cashbackValue, tokenId, contractAddress, feeCurrency, fee, nonce, signatureId } =
    body
  if (feeCurrency && contractAddress) {
    const celoProvider = celoUtils.getProvider(provider)
    const network = await celoProvider.ready
    const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)
    const contract = new new Web3().eth.Contract(Erc721Token_Cashback.abi as any, contractAddress.trim())

    if (signatureId) {
      return JSON.stringify({
        chainId: network.chainId,
        feeCurrency: feeCurrencyContractAddress,
        nonce,
        gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
        gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
        to: contractAddress.trim(),
        data: contract.methods
          .updateCashbackForAuthor(tokenId, evmBasedUtils.amountToWeiHex(cashbackValue))
          .encodeABI(),
      })
    }

    const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
    const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
      wallet,
      feeCurrencyContractAddress,
    )

    const tx: CeloTransactionConfig = {
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce: nonce || txCount,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
      to: contractAddress.trim(),
      data: contract.methods
        .updateCashbackForAuthor(tokenId, evmBasedUtils.amountToWeiHex(cashbackValue))
        .encodeABI(),
      from,
    }
    return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
  }
  throw new EvmBasedSdkError({ code: SdkErrorCode.CELO_MISSING_CONTRACT_ADDRESS })
}

const burnSignedTransaction = async (body: ChainBurnErc721Celo, provider?: string, testnet?: boolean) => {
  const { fromPrivateKey, tokenId, contractAddress, feeCurrency, fee, nonce, signatureId } = body

  const celoProvider = celoUtils.getProvider(provider)
  const network = await celoProvider.ready
  const feeCurrencyContractAddress = celoUtils.getFeeCurrency(feeCurrency, testnet)
  const contract = new new Web3().eth.Contract(Erc721Token_Cashback.abi as any, contractAddress.trim())

  if (signatureId) {
    return JSON.stringify({
      chainId: network.chainId,
      feeCurrency: feeCurrencyContractAddress,
      nonce,
      gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
      gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice),
      to: contractAddress.trim(),
      data: contract.methods.burn(tokenId).encodeABI(),
    })
  }

  const wallet = new CeloWallet(fromPrivateKey as string, celoProvider)
  const { txCount, gasPrice, from } = await celoUtils.obtainWalletInformation(
    wallet,
    feeCurrencyContractAddress,
  )

  const tx: CeloTransactionConfig = {
    chainId: network.chainId,
    feeCurrency: feeCurrencyContractAddress,
    nonce: nonce || txCount,
    gasLimit: evmBasedUtils.gasLimitToHexWithFallback(fee?.gasLimit),
    gasPrice: evmBasedUtils.gasPriceWeiToHexWithFallback(fee?.gasPrice, gasPrice),
    to: contractAddress.trim(),
    data: contract.methods.burn(tokenId).encodeABI(),
    from,
  }
  return await celoUtils.prepareSignedTransactionAbstraction(wallet, tx)
}

export const erc721 = (args: { blockchain: EvmBasedBlockchain; broadcastFunction: BroadcastFunction }) => {
  return {
    prepare: {
      /**
       * Prepare a signed Celo mint erc732 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      mintSignedTransaction: async (body: ChainMintNftCelo, provider?: string, testnet?: boolean) =>
        evmBasedUtils.tryCatch(
          () => mintSignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_MINT_TX,
        ),
      /**
       * Prepare a signed Celo mint cashback erc721 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      mintCashbackSignedTransaction: async (body: ChainMintNftCelo, provider?: string, testnet?: boolean) =>
        evmBasedUtils.tryCatch(
          () => mintCashbackSignedTransaction(body as any, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_MINT_CASHBACK_TX,
        ),

      /**
       * Prepare a signed Celo mint multiple cashback erc721 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      mintMultipleCashbackSignedTransaction: async (
        body: ChainMintMultipleNftCelo,
        provider?: string,
        testnet?: boolean,
      ) =>
        evmBasedUtils.tryCatch(
          () => mintMultipleCashbackSignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_MINT_MULTIPLE_CASHBACK_TX,
        ),
      /**
       * Prepare a signed Celo mint multiple erc721 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      mintMultipleSignedTransaction: async (
        body: ChainMintMultipleNftCelo,
        provider?: string,
        testnet?: boolean,
      ) =>
        evmBasedUtils.tryCatch(
          () => mintMultipleSignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_MINT_MULTIPLE_TX,
        ),
      /**
       * Prepare a signed Celo burn erc721 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      burnSignedTransaction: async (body: ChainBurnErc721Celo, provider?: string, testnet?: boolean) =>
        evmBasedUtils.tryCatch(
          () => burnSignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_BURN_TX,
        ),
      /**
       * Prepare a signed Celo transfer erc721 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      transferSignedTransaction: async (
        body: ChainTransferErc721Celo,
        provider?: string,
        testnet?: boolean,
      ) =>
        evmBasedUtils.tryCatch(
          () => transferSignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_TRANSFER_TX,
        ),
      /**
       * Prepare a signed Celo update cashback for author erc721 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      updateCashbackForAuthorSignedTransaction: async (
        body: ChainUpdateCashbackErc721Celo,
        provider?: string,
        testnet?: boolean,
      ) =>
        evmBasedUtils.tryCatch(
          () => updateCashbackForAuthorSignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_UPDATE_CASHBACK_TX,
        ),
      /**
       * Prepare a signed Celo deploy erc721 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      deploySignedTransaction: async (body: ChainDeployErc721Celo, provider?: string, testnet?: boolean) =>
        evmBasedUtils.tryCatch(
          () => deploySignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_DEPLOY_TX,
        ),
      /**
       * Prepare a signed Celo mint provenance erc732 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      mintProvenanceSignedTransaction: async (body: ChainMintNftCelo, provider?: string, testnet?: boolean) =>
        evmBasedUtils.tryCatch(
          () => mintProvenanceSignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_MINT_PROVENANCE_TX,
        ),
      /**
       * Prepare a signed Celo mint multiple provenance cashback erc721 transaction with the private key locally. Nothing is broadcasted to the blockchain.
       * @returns raw transaction data in hex, to be broadcasted to blockchain.
       */
      mintMultipleProvenanceSignedTransaction: async (
        body: ChainMintMultipleNftCelo & { fixedValues: string[][] },
        provider?: string,
        testnet?: boolean,
      ) =>
        evmBasedUtils.tryCatch(
          () => mintMultipleProvenanceSignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_MINT_MULTIPLE_PROVENANCE_TX,
        ),
      /**
       * Sign add minter to ERC 721 with private keys locally. Nothing is broadcast to the blockchain.
       * @returns transaction data to be broadcast to blockchain.
       */
      addMinterSignedTransaction: (body: ChainAddMinterErc721Celo, provider?: string, testnet?: boolean) =>
        evmBasedUtils.tryCatch(
          () => addMinterSignedTransaction(body, provider, testnet),
          SdkErrorCode.EVM_ERC721_CANNOT_PREPARE_ADD_MINTER,
        ),
    },
    send: {
      /**
       * Send Celo mint erc721 transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      mintSignedTransaction: async (body: ChainMintNftCelo, provider?: string, testnet?: boolean) => {
        if (body.signatureId) {
          return ApiServices.nft.nftMintErc721({
            ...body,
            chain: Blockchain.CELO,
          })
        }
        return args.broadcastFunction({
          txData: await mintSignedTransaction(body, provider, testnet),
        })
      },
      /**
       * Send Celo mint cashback erc721 transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      mintCashbackSignedTransaction: async (body: ChainMintNftCelo, provider?: string, testnet?: boolean) => {
        if (body.signatureId) {
          return ApiServices.nft.nftMintErc721({
            ...body,
            chain: Blockchain.CELO,
          })
        }
        return args.broadcastFunction({
          txData: (await mintCashbackSignedTransaction(body, provider, testnet)) as string,
        })
      },
      /**
       * Send Celo mint multiple cashback erc721 transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      async mintMultipleCashbackSignedTransaction(
        body: ChainMintMultipleNftCelo,
        provider?: string,
        testnet?: boolean,
      ) {
        if (body.signatureId) {
          return ApiServices.nft.nftMintMultipleErc721({
            ...body,
            chain: Blockchain.CELO,
          } as MintMultipleNftKMSCelo)
        }
        return args.broadcastFunction({
          txData: (await mintMultipleCashbackSignedTransaction(body, provider, testnet)) as string,
        })
      },
      /**
       * Send Celo mint multiple erc721 transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      mintMultipleSignedTransaction: async (
        body: ChainMintMultipleNftCelo,
        provider?: string,
        testnet?: boolean,
      ) => {
        if (body.signatureId) {
          return ApiServices.nft.nftMintMultipleErc721({
            ...body,
            chain: Blockchain.CELO,
          } as MintMultipleNftKMSCelo)
        }
        return args.broadcastFunction({
          txData: (await mintMultipleSignedTransaction(body, provider, testnet)) as string,
        })
      },
      /**
       * Send Celo burn erc721 transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      burnSignedTransaction: async (body: ChainBurnErc721Celo, provider?: string, testnet?: boolean) => {
        if (body.signatureId) {
          return ApiServices.nft.nftBurnErc721({
            ...body,
            chain: Blockchain.CELO,
          } as BurnNftKMSCelo)
        }
        return args.broadcastFunction({
          txData: (await burnSignedTransaction(body, provider, testnet)) as string,
        })
      },
      /**
       * Send Celo transfer nft transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      transferSignedTransaction: async (
        body: ChainTransferErc721Celo,
        provider?: string,
        testnet?: boolean,
      ) => {
        if (body.signatureId) {
          return ApiServices.nft.nftTransferErc721({
            ...body,
            chain: Blockchain.CELO,
          } as TransferNftKMSCelo)
        }
        return args.broadcastFunction({
          txData: (await transferSignedTransaction(body, provider, testnet)) as string,
        })
      },
      /**
       * Send Celo update cashback for author erc721 transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      updateCashbackForAuthorSignedTransaction: async (
        body: ChainUpdateCashbackErc721Celo,
        provider?: string,
        testnet?: boolean,
      ) => {
        if (body.signatureId) {
          return ApiServices.nft.nftUpdateCashbackErc721({
            ...body,
            chain: Blockchain.CELO,
          } as UpdateCashbackValueForAuthorNftKMSCelo)
        }
        return args.broadcastFunction({
          txData: (await updateCashbackForAuthorSignedTransaction(body, provider, testnet)) as string,
        })
      },
      /**
       * Send Celo deploy erc721 transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      deploySignedTransaction: async (body: ChainDeployErc721Celo, provider?: string, testnet?: boolean) => {
        if (body.signatureId) {
          return ApiServices.nft.nftDeployErc721({
            ...body,
            chain: Blockchain.CELO,
          } as DeployNftCeloKMS)
        }
        return args.broadcastFunction({
          txData: (await deploySignedTransaction(body, provider, testnet)) as string,
        })
      },
      /**
       * Send Celo mint provenance cashback erc721 transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      mintProvenanceSignedTransaction: async (
        body: ChainMintNftCelo,
        provider?: string,
        testnet?: boolean,
      ) => {
        if (body.signatureId) {
          return ApiServices.nft.nftMintErc721({
            ...body,
            chain: Blockchain.CELO,
          } as MintNftKMSCelo)
        }
        return args.broadcastFunction({
          txData: (await mintProvenanceSignedTransaction(body, provider, testnet)) as string,
        })
      },
      /**
       * Send Celo mint multiple provenance erc721 transaction to the blockchain. This method broadcasts signed transaction to the blockchain.
       * This operation is irreversible.
       * @param testnet mainnet or testnet version
       * @param body content of the transaction to broadcast
       * @param provider url of the Celo Server to connect to. If not set, default public server will be used.
       * @returns transaction id of the transaction in the blockchain
       */
      mintMultipleProvenanceSignedTransaction: async (
        body: ChainMintMultipleNftCelo & { fixedValues: string[][] },
        provider?: string,
        testnet?: boolean,
      ) => {
        if (body.signatureId) {
          return ApiServices.nft.nftMintMultipleErc721({
            ...body,
            chain: Blockchain.CELO,
          } as MintMultipleNftKMSCelo)
        }
        return args.broadcastFunction({
          txData: (await mintMultipleProvenanceSignedTransaction(body, provider, testnet)) as string,
        })
      },
    },
  }
}
