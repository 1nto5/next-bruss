'use server'
import { connectToMongo } from '../utils/mongoConnector'

export async function saveHydraBatch(hydraQr: string) {
  //   if (hydra.length < 34 || !hydra.includes("|")) {
  //     toast.error("NOK QR!");
  //     playNotification("nok");
  //     return;
  //   }
  //   const splittedHydra = hydra.split("|");
  //   const hydraArticle =
  //     splittedHydra[0].length === 7 ? splittedHydra[0].substr(2) : "";
  //   const hydraBatch = splittedHydra[3]
  //     ? splittedHydra[3].substr(2).toUpperCase()
  //     : "";
  //   const hydraQuantity = splittedHydra[2]
  //     ? parseInt(splittedHydra[2].substr(2))
  //     : "";
  //   const hydraProcess = splittedHydra[1] ? splittedHydra[1].substr(2) : "";
  //   if (hydraArticle !== currentArticleRef.current) {
  //     toast.error("NOK artykuł!");
  //     playNotification("nok");
  //     return;
  //   }
  //   if (hydraQuantity !== inBox) {
  //     toast.error("NOK ilość!");
  //     playNotification("nok");
  //     return;
  //   }
  //   if (hydraProcess !== "050" && hydraProcess !== "090") {
  //     // TODO proces from config
  //     toast.error("NOK proces!");
  //     playNotification("nok");
  //     return;
  //   }
  //   saveHydra(hydraBatch);
  // }
  // }, [hydraInputted]);

  try {
    if (hydraQr.length < 34 || !hydraQr.includes('|')) {
      throw new Error('invalid')
    }

    const splittedHydra = hydraQr.split('|')

    const hydraArticle =
      splittedHydra[0].length === 7 ? splittedHydra[0].substr(2) : ''

    const hydraBatch = splittedHydra[3]
      ? splittedHydra[3].substr(2).toUpperCase()
      : ''

    const hydraQuantity = splittedHydra[2]
      ? parseInt(splittedHydra[2].substr(2))
      : ''

    const hydraProcess = splittedHydra[1] ? splittedHydra[1].substr(2) : ''

    const collection = await connectToMongo('only_pallet_label') // Pass the collection name to connectToMongo / connect Mongo :)

    // Check for existing data
    const existingData = await collection.findOne({
      hydra_batch: hydraBatch,
    })

    if (existingData) {
      throw new Error('exists')
    }

    // Insert or update data
    const result = await collection.insertOne({ hydra_batch: hydraBatch }) // inserting the hydraBatch to the collection

    if (result) {
      return { status: 'saved' } // return status
    }
  } catch (error) {
    throw error // Rethrow the error
  }
}
