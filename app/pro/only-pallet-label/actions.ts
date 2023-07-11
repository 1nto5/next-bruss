'use server'
import { connectToMongo } from '@/lib/mongo/connector'
import { headers } from 'next/headers'
import { configDataOnlyPalletLabel as configData } from '@/lib/utils/pro/configData'
import { on } from 'events'

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

// Save Hydra Batch function
export async function saveHydraBatch(
  hydraQr: string,
  articleNumber: number,
  operatorPersonalNumber: number
) {
  try {
    const referer = headers().get('referer')
    const workplace = referer?.split('/').pop()

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

// Function to get the number of documents with a specific status, article number, and workplace
async function countOnPallet(workplace: string, articleNumber: number) {
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
async function getPalletSize(workplace: string, articleNumber: number) {
  // Find the workplace and article configuration
  const workplaceConfig = configData.find(
    (w: WorkplaceConfig) => w.workplace === workplace
  )
  const articleConfig = workplaceConfig?.articles.find(
    (a: ArticleConfig) => a.number === articleNumber
  )

  // Return the pallet size
  return articleConfig?.palletSize
}

// Function to calculate and return the quantity on pallet / pallet size
export async function getQuantityOnPallet(articleNumber: number) {
  try {
    // Call the countOnPallet and getPalletSize functions
    const count = await countOnPallet('136-153', articleNumber)
    const size = await getPalletSize('136-153', articleNumber)

    // Calculate the quantity
    const onPallet = `${count} / ${size}`

    // Return the quantity as a string
    console.log(onPallet)
    return onPallet
  } catch (error) {
    console.error(error)
    throw new Error(
      'An error occurred while calculating the quantity on the pallet.'
    )
  }
}
