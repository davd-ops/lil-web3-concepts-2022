
const sharp = require('sharp');

const PROJECT_NAME = 'TEST PROJECT'

type MetadataObject = {
    name: string,
    image: string,
    weight: number
}

const background:MetadataObject[] = [
    {
        name: 'Blue Background',
        image: './traits/background/blue.png',
        weight: 1500,
    },
    {
        name: 'Green Background',
        image: './traits/background/green.png',
        weight: 1500,
    },
    {
        name: 'Pink Background',
        image: './traits/background/pink.png',
        weight: 1500,
    },
    {
        name: 'Golden Background',
        image: './traits/background/golden.png',
        weight: 200,
    },
    {
        name: 'Demon Background',
        image: './traits/background/demon.png',
        weight: 200,
    },
    {
        name: 'Zombie Background',
        image: './traits/background/zombie.png',
        weight: 100,
    },
]

const body:MetadataObject[] = [
    {
        name: 'White skin',
        image: './traits/body/white_body.png',
        weight: 1500,
    },
    {
        name: 'Dark skin',
        image: './traits/body/dark_body.png',
        weight: 1500,
    },
    {
        name: 'Yellow skin',
        image: './traits/body/yellow_body.png',
        weight: 1500,
    },
    {
        name: 'Demon skin',
        image: './traits/body/demon_body.png',
        weight: 200,
    },
    {
        name: 'Avatar skin',
        image: './traits/body/avatar_body.png',
        weight: 200,
    },
    {
        name: 'Zombie skin',
        image: './traits/body/zombie_body.png',
        weight: 100,
    },
]

const clothes:MetadataObject[] = [
    {
        name: 'White tee',
        image: './traits/clothes/white_tee.png',
        weight: 1500,
    },
    {
        name: 'Dark tee',
        image: './traits/clothes/dark_tee.png',
        weight: 1500,
    },
    {
        name: 'Yellow tee',
        image: './traits/clothes/yellow_tee.png',
        weight: 1500,
    },
    {
        name: 'Red hoodie',
        image: './traits/clothes/red_hoodie.png',
        weight: 200,
    },
    {
        name: 'Blue hoodie',
        image: './traits/clothes/blue_hoodie.png',
        weight: 200,
    },
    {
        name: 'Green hoodie',
        image: './traits/clothes/green_hoodie.png',
        weight: 100,
    },
]

const hat:MetadataObject[] = [
    {
        name: 'None',
        image: './traits/none_trait.png',
        weight: 1500,
    },
    {
        name: 'Just a hat',
        image: './traits/hat/just_a_hat.png',
        weight: 1500,
    },
    {
        name: 'No-cap Cap',
        image: './traits/hat/nocap_cap.png',
        weight: 1500,
    },
    {
        name: 'Bucket of water',
        image: './traits/hat/bucket_of_water.png',
        weight: 200,
    },
    {
        name: 'Magicians hat',
        image: './traits/hat/magicians_hat.png',
        weight: 200,
    },
    {
        name: 'Beanie',
        image: './traits/hat/beanie.png',
        weight: 100,
    },
]

const accessories:MetadataObject[] = [
    {
        name: 'None',
        image: './traits/none_trait.png',
        weight: 1500,
    },
    {
        name: 'Yellow Earring',
        image: './traits/accessories/yellow_earring.png',
        weight: 1500,
    },
    {
        name: 'Blue Earring',
        image: './traits/accessories/blue_earring.png',
        weight: 1500,
    },
    {
        name: 'Tattoos',
        image: './traits/accessories/tattoos.png',
        weight: 200,
    },
    {
        name: '3D glasses',
        image: './traits/accessories/3d_glasses.png',
        weight: 200,
    },
    {
        name: 'Laser eyes',
        image: './traits/accessories/laser_eyes.png',
        weight: 100,
    },
]

//sort these from background to the front
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

const generateImage = async (traits: Array<MetadataObject>, tokenId: number) => {    
        console.log('traits[0]');
        console.log(traits[0]);
        
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
}

const generateMetadata = async (traits: Array<MetadataObject>, tokenId: number) => {
    const metadata = {
        name: `${PROJECT_NAME} ${tokenId}`,
        description: `This is token ${tokenId} of collection ${PROJECT_NAME}`, 
        image: '', 
        attributes: [
            {
                trait_type: '', 
                value: traits[0].image,
            }, 
            {
                trait_type: '', 
                value: '',
            }, 
        ], 
    }
}

const uploadToIPFS = (traits: Array<object>) => {

}

const uploadImagesToIPFS = (traits: Array<object>) => {

}

const generate = async (numberOfTokens: number) => {
    for(let tokenId:number = 0; tokenId < numberOfTokens; tokenId++) {
        const selectedTraits:MetadataObject[] = []
        Object.keys(traits).forEach((element: string) => {
            selectedTraits.push(selectRandomTraitUsingWeightedRarities(traits[element]))
        })

        try {
            await generateImage(selectedTraits, tokenId)
            await generateMetadata(selectedTraits, tokenId)
            //await uploadImagesToIPFS() //TODO
            //await uploadToIPFS() //TODO
        } catch(err) {
            console.log(err)
        }
    }
}


console.log(
    '\n\n******************************** \n\n        PROGRAM INITIATED \n\n ********************************\n\n'
)

let random = Math.random() * 18

generate(2)
   