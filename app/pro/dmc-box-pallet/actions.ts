'use server'
import { connectToMongo } from '@/lib/mongo/connector'
import { productionConfig } from '@/lib/utils/pro/config'
import generatePalletQr from '@/lib/utils/pro/generatePalletQr'
import {
  fordValidation,
  bmwValidation,
} from '@/lib/utils/pro/dmcDateValidation'

// Define Types
type ArticleObject = {
  workplace: string
  type: string
  article: number
  name: string
  note?: string
  baseDmc?: string
  dmcFirVal?: [number, number]
  dmcSecVal?: [number, number]
  ford?: boolean
  bmw?: boolean
  palletSize: number
  boxSize: number
  hydraProc: string // If hydraProc is supposed to be an array, use 'string[]'
}

const collectionName = 'dmc'

// Function to get the number of documents with a specific status, article number, and workplace
export async function countInBox(workplace: string, articleNumber: number) {
  try {
    // Connect to MongoDB
    const collection = await connectToMongo(collectionName)

    // Query the collection
    const count = await collection.countDocuments({
      status: 'box',
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

// Function to get the number of documents with a specific status, article number, and workplace
export async function countOnPallet(workplace: string, articleNumber: number) {
  try {
    // Connect to MongoDB
    const collection = await connectToMongo(collectionName)

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
    // Find the article configuration
    const articleConfig = productionConfig.find(
      (object: ArticleObject) =>
        object.workplace === workplace && object.article === articleNumber
    )

    // Return the pallet size, or null if the article is not found
    return articleConfig ? articleConfig.palletSize : null
  } catch (error) {
    console.error('Error while getting the pallet size:', error)
    return null
  }
}

// Function to get the box size for a specific workplace and article
export async function getBoxSize(workplace: string, articleNumber: number) {
  try {
    // Find the article configuration
    const articleConfig = productionConfig.find(
      (object: ArticleObject) =>
        object.workplace === workplace && object.article === articleNumber
    )

    // Return the box size, or null if the article is not found
    return articleConfig ? articleConfig.boxSize : null
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
    return generatePalletQr(articleNumber, quantityOnPallet, '876')
  } catch (error) {
    console.error(error)
    throw new Error('An error occurred while generating pallet qr.')
  }
}

// Save DMC function
// TODO
export async function saveDmc(
  dmc: string,
  workplace: string,
  articleNumber: number,
  operatorPersonalNumber: number
) {
  try {
    // Find the article configuration
    const articleConfig = productionConfig.find(
      (object: ArticleObject) =>
        object.workplace === workplace && object.article === articleNumber
    )

    // DMC length
    if (dmc.length !== articleConfig.baseDmc.length) {
      return { status: 'invalid' }
    }

    // DMC content
    if (
      dmc.substring(articleConfig.dmcFirVal[0], articleConfig.dmcFirVal[1]) !==
      articleConfig.baseDmc.substring(
        articleConfig.dmcFirVal[0],
        articleConfig.dmcFirVal[1]
      )
    ) {
      return { status: 'invalid' }
    }

    if (
      articleConfig.dmcSecVal &&
      dmc.substring(articleConfig.dmcSecVal[0], articleConfig.dmcSecVal[1]) !==
        articleConfig.baseDmc.substring(
          articleConfig.dmcSecVal[0],
          articleConfig.dmcSecVal[1]
        )
    ) {
      return { status: 'invalid' }
    }

    // FORD date
    if (articleConfig.ford && !fordValidation(dmc)) {
      return { status: 'wrong date' }
    }

    // BMW date
    if (articleConfig.bmw && !bmwValidation(dmc)) {
      return { status: 'wrong date' }
    }

    // Connect to MongoDB
    const collection = await connectToMongo(collectionName)

    // Check for existing data
    const existingData = await collection.findOne({ dmc: dmc })
    if (existingData) {
      return { status: 'exists' }
    }

    // Check if pallet is full
    const onPallet = await countOnPallet(workplace, articleNumber)
    const palletSize = await getPalletSize(workplace, articleNumber)
    if (onPallet >= palletSize) {
      return { status: 'full pallet' }
    }

    // Check if box is full
    const inBox = await countInBox(workplace, articleNumber)
    const boxSize = await getBoxSize(workplace, articleNumber)
    if (onPallet >= palletSize) {
      return { status: 'full box' }
    }

    // Insert data
    const insertResult = await collection.insertOne({
      status: 'box',
      dmc: dmc,
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

// Save Hydra Batch function
export async function saveHydraBatch(
  hydraQr: string,
  workplace: string,
  articleNumber: number,
  operatorPersonalNumber: number
) {
  try {
    // Find workplace and article configuration
    const workplaceConfig = productionConfig.find(
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
    const collection = await connectToMongo(collectionName)

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
  workplace: string,
  articleNumber: number,
  quantityOnPallet: number,
  operatorPersonalNumber: number
) {
  try {
    // Find workplace and article configuration
    const workplaceConfig = productionConfig.find(
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
