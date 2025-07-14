import sql from "../configs/db.js"
import 'dotenv/config';

//
export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth()

        const creations = await sql`SELECT * FROM creations WHERE user_id=${userId} ORDER BY created_at DESC`

        res.json({ success: true, creations })

    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const getPublicCreations = async (req, res) => {
    try {
        const rawCreations = await sql`SELECT * FROM creations ORDER BY created_at DESC`;

        res.json({ success: true, creations: rawCreations })

    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const toggleLikeCreations = async (req, res) => {
    try {

        const { userId } = req.auth()
        const { id } = req.body

        const [creation] = await sql`SELECT * FROM creations WHERE id=${id}`

        if(!creation){
            return res.json({success:false,message:'creation not found'})
        }

        const currentLikes=creation.likes
        const userIdStr=userId.toString()
        let updatedLikes
        let message

        if(currentLikes.includes(userId)){
            updatedLikes=currentLikes.filter((user)=>user!==userIdStr)
            message='Creation Unliked'
        }else{
         updatedLikes=[...currentLikes,userIdStr]
         message='creation Liked'   
        }

        const formattedArray=`{${updatedLikes.join(',')}}`

        await sql`UPDATE creations SET likes=${formattedArray}::text[] WHERE id=${id}`

        res.json({ success: true, message })

    }
    catch (error) {
        res.json({ success: false, message: error.message })
    }
}
