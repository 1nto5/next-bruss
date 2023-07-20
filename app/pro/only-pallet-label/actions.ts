'use server'
import { connectToMongo } from '@/lib/mongo/connector'
import { configDataOnlyPalletLabel as configData } from '@/lib/utils/pro/configData'
import generatePalletQr from '@/lib/utils/pro/generatePalletQr'

// Define Types
type ArticleConfig = {
  number: number
  name: string
  palletSize: number
  boxSize: number
  hydraProcess: string[]
}

type WorkplaceConfig = {
  workplace: string
  articles: ArticleConfig[]
}

// Function to get the number of documents with a specific status, article number, and workplace
export async function countOnPallet(workplace: string, articleNumber: number) {
  try {
    // Connect to MongoDB
    const collection = await connectToMongo('only_pallet_label')

    // Query the collection
    const count = await collection.countDocuments({
      status: 'pallet',
      workplace: workplace,
      article: articleNumber,
    })

    // Return the count
    return count
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while counting the documents.')
  }
}

// Function to get the pallet size for a specific workplace and article
export async function getPalletSize(workplace: string, articleNumber: number) {
  try {
    // Find the workplace and article configuration
    const workplaceConfig = configData.find(
      (w: WorkplaceConfig) => w.workplace === workplace
    )
    const articleConfig = workplaceConfig?.articles.find(
      (a: ArticleConfig) => a.number === articleNumber
    )

    // Return the pallet size
    return articleConfig?.palletSize
  } catch (error) {
    console.error('Error while getting the pallet size:', error)
    return null
  }
}

// Function to get the box size for a specific workplace and article
export async function getBoxSize(workplace: string, articleNumber: number) {
  try {
    // Find the workplace and article configuration
    const workplaceConfig = configData.find(
      (w: WorkplaceConfig) => w.workplace === workplace
    )
    const articleConfig = workplaceConfig?.articles.find(
      (a: ArticleConfig) => a.number === articleNumber
    )

    // Return the box size
    return articleConfig?.boxSize
  } catch (error) {
    console.error('Error while getting the box size:', error)
    return null
  }
}

// Generate pallet QR
export async function getPalletQr(
  articleNumber: number,
  quantityOnPallet: number
) {
  try {
    return generatePalletQr(articleNumber, quantityOnPallet, 'PL')
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while generating pallet qr.')
  }
}

// Save Hydra Batch function
export async function saveHydraBatch(
  hydraQr: string,
  workplace: string,
  articleNumber: number,
  operatorPersonalNumber: number
) {
  try {
    // Find workplace and article configuration
    const workplaceConfig = configData.find(
      (w: WorkplaceConfig) => w.workplace === workplace
    )
    const articleConfig = workplaceConfig?.articles.find(
      (a: ArticleConfig) => a.number === articleNumber
    )

    // // Validate hydra QR code
    if (hydraQr.length < 34 || !hydraQr.includes('|')) {
      return { status: 'invalid' }
    }

    // // Split QR code
    const splitHydraQr = hydraQr.split('|')
    const qrArticleNumber =
      splitHydraQr[0].length === 7 && Number(splitHydraQr[0].substr(2))

    // // Check article number
    if (qrArticleNumber !== articleNumber) {
      return { status: 'wrong article' }
    }

    // Check quantity
    const qrQuantity = splitHydraQr[2] && parseInt(splitHydraQr[2].substr(2))
    if (qrQuantity !== articleConfig.boxSize) {
      return { status: 'wrong quantity' }
    }

    // Check process
    const qrProcess = splitHydraQr[1] && splitHydraQr[1].substr(2)
    if (!articleConfig.hydraProc.includes(qrProcess)) {
      return { status: 'wrong process' }
    }

    // Extract batch from QR code
    const qrBatch = splitHydraQr[3] && splitHydraQr[3].substr(2).toUpperCase()

    // Connect to MongoDB
    const collection = await connectToMongo('only_pallet_label')

    // Check for existing data
    const existingData = await collection.findOne({ hydra_batch: qrBatch })
    if (existingData) {
      return { status: 'exists' }
    }

    // Check if pallet is full
    const onPallet = await countOnPallet(workplace, articleNumber)
    const palletSize = await getPalletSize(workplace, articleNumber)
    if (onPallet >= palletSize) {
      return { status: 'full pallet' }
    }

    // Insert data
    const insertResult = await collection.insertOne({
      status: 'pallet',
      hydra_batch: qrBatch,
      workplace: workplace,
      article: articleNumber,
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
  workplace: string,
  articleNumber: number,
  quantityOnPallet: number,
  operatorPersonalNumber: number
) {
  try {
    // Find workplace and article configuration
    const workplaceConfig = configData.find(
      (w: WorkplaceConfig) => w.workplace === workplace
    )
    const articleConfig = workplaceConfig?.articles.find(
      (a: ArticleConfig) => a.number === articleNumber
    )

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
    if (qrProcess !== 'OPL') {
      return { status: 'wrong process' }
    }

    // Extract batch from QR code
    const qrBatch = splitPalletQr[3] && splitPalletQr[3].substr(2).toUpperCase()

    // Connect to MongoDB
    const collection = await connectToMongo('only_pallet_label')

    // Check for existing data
    const existingData = await collection.findOne({ pallet_batch: qrBatch })
    if (existingData) {
      return { status: 'exists' }
    }

    // Update documents with matching criteria
    const updateResult = await collection.updateMany(
      {
        status: 'pallet',
        workplace: workplace,
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
