import { Web3Storage, getFilesFromPath, CIDString } from 'web3.storage'
require('dotenv').config({ path: '../../../../.env' })
 

const token = process.env.IPFS_API_KEY
const client = (typeof token === "string") ? new Web3Storage({ token }) : undefined 

const uploadMetadataToIPFS = async () => {
    const files = await getFilesFromPath('./metadata/')
    return await client?.put(files)
}

const upload = async () => {
    let BASE_URI: CIDString | undefined
        try {
            BASE_URI = await uploadMetadataToIPFS()
        } catch(err) {
            console.log(err)
        }

        console.log(
            `\n\n******************************** \n\n        UPLOAD FINISHED SUCCESSFULLY \n\n        BASE URI = ${BASE_URI} \n\n ********************************\n\n`
        )
}


console.log(
    '\n\n******************************** \n\n        UPLOAD INITIATED \n\n ********************************\n\n'
)

upload()

//TODO: UPLOAD WITHOUT THE FILE NAMES, STRAIGHT UNDER CID