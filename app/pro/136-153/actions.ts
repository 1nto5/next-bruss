'use server'
import { connectToMongo } from '@/lib/mongo/connector'
import generatePalletQr from '@/lib/utils/pro/generatePalletQr'
import { productionConfig } from '@/lib/utils/pro/config'

// Define Types
type ArticleConfig = {
  article: number
  name: string
  palletSize: number
  boxSize: number
  hydraProcess: string[]
}

const collectionName = '136_153'

export async function getPalletSize(article: number) {
  const articleConfig = config.find(
    (config: ArticleConfig) => config.article === article
  )

  if (articleConfig) {
    return articleConfig.palletSize
  }

  return null
}

export async function getBoxSize(article: number) {
  const articleConfig = config.find(
    (config: ArticleConfig) => config.article === article
  )

  if (articleConfig) {
    return articleConfig.boxSize
  }

  return null
}

export async function getArticleName(article: number) {
  const articleConfig = config.find(
    (config: ArticleConfig) => config.article === article
  )

  if (articleConfig) {
    return articleConfig.name
  }

  return null
}

// Function to get the number of documents with a specific status and article number,
export async function countOnPallet(articleNumber: number) {
  try {
    // Connect to MongoDB
    const collection = await connectToMongo(collectionName)

    // Query the collection
    const count = await collection.countDocuments({
      status: 'pallet',
      article: articleNumber,
    })

    // Return the count
    return count
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while counting the documents.')
  }
}

// Generate pallet QR
export async function getPalletQr(
  articleNumber: number,
  quantityOnPallet: number
) {
  try {
    return generatePalletQr(articleNumber, quantityOnPallet, '876')
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while generating pallet qr.')
  }
}

// Save Hydra Batch function
export async function saveHydraBatch(
  hydraQr: string,
  operatorPersonalNumber: number
) {
  try {
    // // Validate hydra QR code
    if (hydraQr.length < 34 || !hydraQr.includes('|')) {
      return { status: 'invalid' }
    }

    // // Split QR code
    const splitHydraQr = hydraQr.split('|')
    const qrArticleNumber =
      splitHydraQr[0].length === 7 && Number(splitHydraQr[0].substr(2))

    // // Check article number
    if (qrArticleNumber !== 28067 && qrArticleNumber !== 28042) {
      return { status: 'wrong article' }
    }

    const articleConfig = config.find(
      (config: ArticleConfig) => config.article === qrArticleNumber
    )
    // Check quantity
    const qrQuantity = splitHydraQr[2] && parseInt(splitHydraQr[2].substr(2))
    if (qrQuantity !== articleConfig.boxSize) {
      return { status: 'wrong quantity' }
    }

    // Check process
    const qrProcess = splitHydraQr[1] && splitHydraQr[1].substr(2)
    if (qrProcess !== articleConfig.hydraProc) {
      console.log(articleConfig.hydraProc)
      return { status: 'wrong process' }
    }

    // Extract batch from QR code
    const qrBatch = splitHydraQr[3] && splitHydraQr[3].substr(2).toUpperCase()

    // Connect to MongoDB
    const collection = await connectToMongo(collectionName)

    // Check for existing data
    const existingData = await collection.findOne({ hydra_batch: qrBatch })
    if (existingData) {
      return { status: 'exists' }
    }

    // Check if pallet is full
    const onPallet = await countOnPallet(qrArticleNumber)

    if (onPallet >= articleConfig.palletSize) {
      return { status: 'full pallet' }
    }

    // Insert data
    const insertResult = await collection.insertOne({
      status: 'pallet',
      hydra_batch: qrBatch,
      workplace: '136-153',
      article: qrArticleNumber,
      quantity: qrQuantity,
      operator: operatorPersonalNumber,
      time: new Date(),
    })

    if (insertResult) {
      return { status: 'saved' }
    }
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while saving the hydra batch.')
  }
}

// Save Pallet Batch function
export async function savePalletBatch(
  palletQr: string,
  articleNumber: number,
  quantityOnPallet: number,
  operatorPersonalNumber: number
) {
  try {
    // // Validate hydra QR code
    if (palletQr.length < 34 || !palletQr.includes('|')) {
      return { status: 'invalid' }
    }

    // // Split QR code
    const splitPalletQr = palletQr.split('|')
    const qrArticleNumber =
      splitPalletQr[0].length === 7 && Number(splitPalletQr[0].substr(2))

    // // Check article number
    if (qrArticleNumber !== articleNumber) {
      return { status: 'wrong article' }
    }

    // Check quantity
    const qrQuantity = splitPalletQr[2] && parseInt(splitPalletQr[2].substr(2))
    if (qrQuantity !== quantityOnPallet) {
      return { status: 'wrong quantity' }
    }

    // Check process
    const qrProcess = splitPalletQr[1] && splitPalletQr[1].substr(2)
    if (qrProcess !== '876') {
      return { status: 'wrong process' }
    }

    // Extract batch from QR code and test length
    const qrBatch = splitPalletQr[3] && splitPalletQr[3].substr(2).toUpperCase()
    if (!qrBatch || qrBatch.length !== 10) {
      return { status: 'invalid' }
    }

    // Connect to MongoDB
    const collection = await connectToMongo(collectionName)

    // Check for existing data
    const existingData = await collection.findOne({ pallet_batch: qrBatch })
    if (existingData) {
      return { status: 'exists' }
    }

    // Update documents with matching criteria
    const updateResult = await collection.updateMany(
      {
        status: 'pallet',
        article: articleNumber,
      },
      {
        $set: {
          status: 'warehouse',
          pallet_batch: qrBatch,
          pallet_time: new Date(),
          pallet_operator: operatorPersonalNumber,
        },
      }
    )

    if (updateResult) {
      return { status: 'saved' }
    }
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while saving the pallet batch.')
  }
}
