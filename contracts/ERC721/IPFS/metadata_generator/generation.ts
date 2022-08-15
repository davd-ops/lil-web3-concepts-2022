
const sharp = require('sharp');
const fs = require('fs');
import { Web3Storage, getFilesFromPath, CIDString } from 'web3.storage'
require('dotenv').config({ path: '../../../../.env' })
 

const token = process.env.IPFS_API_KEY
const client = (typeof token === "string") ? new Web3Storage({ token }) : undefined

const PROJECT_NAME = 'TEST PROJECT'

type MetadataObject = {
    trait_type: string;
    name: string,
    image: string,
    weight: number
}

const background:MetadataObject[] = [
    {
        trait_type: 'background',
        name: 'Blue Background',
        image: './traits/background/blue.png',
        weight: 1500,
    },
    {
        trait_type: 'background',
        name: 'Green Background',
        image: './traits/background/green.png',
        weight: 1500,
    },
    {
        trait_type: 'background',
        name: 'Pink Background',
        image: './traits/background/pink.png',
        weight: 1500,
    },
    {
        trait_type: 'background',
        name: 'Golden Background',
        image: './traits/background/golden.png',
        weight: 200,
    },
    {
        trait_type: 'background',
        name: 'Demon Background',
        image: './traits/background/demon.png',
        weight: 200,
    },
    {
        trait_type: 'background',
        name: 'Zombie Background',
        image: './traits/background/zombie.png',
        weight: 100,
    },
]

const body:MetadataObject[] = [
    {
        trait_type: 'body',
        name: 'White skin',
        image: './traits/body/white_body.png',
        weight: 1500,
    },
    {
        trait_type: 'body',
        name: 'Dark skin',
        image: './traits/body/dark_body.png',
        weight: 1500,
    },
    {
        trait_type: 'body',
        name: 'Yellow skin',
        image: './traits/body/yellow_body.png',
        weight: 1500,
    },
    {
        trait_type: 'body',
        name: 'Demon skin',
        image: './traits/body/demon_body.png',
        weight: 200,
    },
    {
        trait_type: 'body',
        name: 'Avatar skin',
        image: './traits/body/avatar_body.png',
        weight: 200,
    },
    {
        trait_type: 'body',
        name: 'Zombie skin',
        image: './traits/body/zombie_body.png',
        weight: 100,
    },
]

const clothes:MetadataObject[] = [
    {
        trait_type: 'clothes',
        name: 'White tee',
        image: './traits/clothes/white_tee.png',
        weight: 1500,
    },
    {
        trait_type: 'clothes',
        name: 'Dark tee',
        image: './traits/clothes/dark_tee.png',
        weight: 1500,
    },
    {
        trait_type: 'clothes',
        name: 'Yellow tee',
        image: './traits/clothes/yellow_tee.png',
        weight: 1500,
    },
    {
        trait_type: 'clothes',
        name: 'Red hoodie',
        image: './traits/clothes/red_hoodie.png',
        weight: 200,
    },
    {
        trait_type: 'clothes',
        name: 'Blue hoodie',
        image: './traits/clothes/blue_hoodie.png',
        weight: 200,
    },
    {
        trait_type: 'clothes',
        name: 'Green hoodie',
        image: './traits/clothes/green_hoodie.png',
        weight: 100,
    },
]

const hat:MetadataObject[] = [
    {
        trait_type: 'hat',
        name: 'None',
        image: './traits/none_trait.png',
        weight: 1500,
    },
    {
        trait_type: 'hat',
        name: 'Just a hat',
        image: './traits/hat/just_a_hat.png',
        weight: 1500,
    },
    {
        trait_type: 'hat',
        name: 'No-cap Cap',
        image: './traits/hat/nocap_cap.png',
        weight: 1500,
    },
    {
        trait_type: 'hat',
        name: 'Bucket of water',
        image: './traits/hat/bucket_of_water.png',
        weight: 200,
    },
    {
        trait_type: 'hat',
        name: 'Magicians hat',
        image: './traits/hat/magicians_hat.png',
        weight: 200,
    },
    {
        trait_type: 'hat',
        name: 'Beanie',
        image: './traits/hat/beanie.png',
        weight: 100,
    },
]

const accessories:MetadataObject[] = [
    {
        trait_type: 'accessories',
        name: 'None',
        image: './traits/none_trait.png',
        weight: 1500,
    },
    {
        trait_type: 'accessories',
        name: 'Yellow Earring',
        image: './traits/accessories/yellow_earring.png',
        weight: 1500,
    },
    {
        trait_type: 'accessories',
        name: 'Blue Earring',
        image: './traits/accessories/blue_earring.png',
        weight: 1500,
    },
    {
        trait_type: 'accessories',
        name: 'Tattoos',
        image: './traits/accessories/tattoos.png',
        weight: 200,
    },
    {
        trait_type: 'accessories',
        name: '3D glasses',
        image: './traits/accessories/3d_glasses.png',
        weight: 200,
    },
    {
        trait_type: 'accessories',
        name: 'Laser eyes',
        image: './traits/accessories/laser_eyes.png',
        weight: 100,
    },
]

/**
    * @dev sort these from background to the front
*/
const traits: {[index: string]:any} = { 
    background,
    body,
    accessories,
    clothes,
    hat, 
}

const selectRandomTraitUsingWeightedRarities = (options: Array<MetadataObject>) => {
    let i: number

    let weights: number[] = []

    for (i = 0; i < options.length; i++)
        weights[i] = options[i].weight + (weights[i - 1] || 0)

    let random = Math.random() * weights[weights.length - 1]

    for (i = 0; i < weights.length; i++)
        if (weights[i] > random)
            break

    return options[i]
}

const uploadImageToIPFS = async (tokenId: number) => {
    const files = await getFilesFromPath(`./outcome/${tokenId}.png`)
    const cid = await client?.put(files)
    return cid
}

/**
    * @dev needs to be updated with every new trait
*/
const generateImage = async (traits: Array<MetadataObject>, tokenId: number) => {    

        sharp(traits[0].image) //the background
        .composite([ //input all traits here
            { input: traits[1].image },
            { input: traits[2].image },
            { input: traits[3].image },
            { input: traits[4].image },
        ])
        .toFile(`./outcome/${tokenId}.png`, (err: any) => { 
            if (err){
                console.log(
                    `\n\n******************************** \n\n        ${typeof err !== null ? err : null} \n\n ********************************\n\n`
                )
                throw Error (err?.message)
            }
         })

         return await uploadImageToIPFS(tokenId)
}

// const uploadImagesToIPFS = async (traits: Array<object>) => {
//     const files = await getFilesFromPath('/path/to/file')
//     const cid = await client.put(files)
//     console.log(cid)
// }

/**
    * @dev needs to be updated with every new trait
*/
const generateMetadata = async (traits: Array<MetadataObject>, tokenId: number, cid: CIDString | undefined) => {
    const metadata = {
        name: `${PROJECT_NAME} ${tokenId}`,
        description: `This is token ${tokenId} of collection ${PROJECT_NAME}`, 
        image: `ipfs://${cid}/${tokenId}.png`, 
        attributes: [
            {
                trait_type: traits[0].trait_type, 
                value: traits[0].image,
            }, 
            {
                trait_type: traits[1].trait_type, 
                value: traits[1].image,
            }, 
            {
                trait_type: traits[2].trait_type, 
                value: traits[2].image,
            }, 
            {
                trait_type: traits[3].trait_type, 
                value: traits[3].image,
            }, 
            {
                trait_type: traits[4].trait_type, 
                value: traits[4].image,
            }, 
        ], 
    }

    fs.writeFileSync(`./metadata/${tokenId}`, JSON.stringify(metadata, null, 2)); 
}

const generate = async (numberOfTokens: number) => {
    for(let tokenId:number = 1; tokenId <= numberOfTokens; tokenId++) {
        const selectedTraits:MetadataObject[] = []
        Object.keys(traits).forEach((element: string) => {
            selectedTraits.push(selectRandomTraitUsingWeightedRarities(traits[element]))
        })

        try {
            const cid = await generateImage(selectedTraits, tokenId)
            await generateMetadata(selectedTraits, tokenId, cid)
        } catch(err) {
            console.log(err)
        }
    }
    console.log(
        '\n\n******************************** \n\n        GENERATION FINISHED SUCCESSFULLY \n\n ********************************\n\n'
    )
}


console.log(
    '\n\n******************************** \n\n        GENERATION INITIATED \n\n ********************************\n\n'
)

/**
    * @dev run with the totalSupply
*/
generate(2)
   
