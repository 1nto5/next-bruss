'use server'
import { connectToMongo } from '@/lib/mongo/connector'
import generatePalletQr from '@/lib/utils/pro/generatePalletQr'
import { productionConfig } from '@/lib/utils/pro/config'

// Define Types
type ArticleConfigObject = {
  workplace: string
  type: string
  article: number
  name: string
  note?: string
  palletSize: number
  boxSize: number
  hydraProc: string
  palletProc: string
}

const collectionName = '136_153'

export async function getPalletSize(article: number) {
  // Find the article configuration
  const articleConfig = productionConfig.find(
    (object: ArticleConfigObject) =>
      object.workplace === '136-153' && object.article === article
  )

  if (articleConfig) {
    return articleConfig.palletSize
  }

  return null
}

export async function getBoxSize(article: number) {
  // Find the article configuration
  const articleConfig = productionConfig.find(
    (object: ArticleConfigObject) =>
      object.workplace === '136-153' && object.article === article
  )

  if (articleConfig) {
    return articleConfig.boxSize
  }

  return null
}

export async function getArticleName(article: number) {
  // Find the article configuration
  const articleConfig = productionConfig.find(
    (object: ArticleConfigObject) =>
      object.workplace === '136-153' && object.article === article
  )

  if (articleConfig) {
    return articleConfig.name
  }

  return null
}

// Function to get the number of documents with a specific status and article number,
export async function countOnPallet(article: number) {
  try {
    // Connect to MongoDB
    const collection = await connectToMongo(collectionName)

    // Query the collection
    const count = await collection.countDocuments({
      status: 'pallet',
      article: article,
    })

    // Return the count
    return count
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while counting the documents.')
  }
}

// Generate pallet QR
export async function getPalletQr(article: number, quantityOnPallet: number) {
  try {
    // Find the article configuration
    const articleConfig = productionConfig.find(
      (object: ArticleConfigObject) =>
        object.workplace === '136-153' && object.article === article
    )
    return generatePalletQr(article, quantityOnPallet, articleConfig.palletProc)
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
    const qrarticle =
      splitHydraQr[0].length === 7 && Number(splitHydraQr[0].substr(2))

    // // Check article number
    if (qrarticle !== 28067 && qrarticle !== 28042) {
      return { status: 'wrong article' }
    }

    // Find the article configuration
    const articleConfig = productionConfig.find(
      (object: ArticleConfigObject) =>
        object.workplace === '136-153' && object.article === qrarticle
    )

    // Check quantity
    const qrQuantity = splitHydraQr[2] && parseInt(splitHydraQr[2].substr(2))
    if (qrQuantity !== articleConfig.boxSize) {
      return { status: 'wrong quantity' }
    }

    // Check process
    const qrProcess = splitHydraQr[1] && splitHydraQr[1].substr(2)
    if (qrProcess !== articleConfig.hydraProc) {
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
    const onPallet = await countOnPallet(qrarticle)

    if (onPallet >= articleConfig.palletSize) {
      return { status: 'full pallet' }
    }

    // Insert data
    const insertResult = await collection.insertOne({
      status: 'pallet',
      hydra_batch: qrBatch,
      workplace: '136-153',
      article: qrarticle,
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
  article: number,
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
    const qrarticle =
      splitPalletQr[0].length === 7 && Number(splitPalletQr[0].substr(2))

    // // Check article number
    if (qrarticle !== article) {
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
        article: article,
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
