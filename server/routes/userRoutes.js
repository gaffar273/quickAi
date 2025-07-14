import express from 'express'
import { auth } from '../middlewares/auth.js'
import { getPublicCreations, getUserCreations, toggleLikeCreations } from '../controllers/usercontroller.js'

const userRouter=express.Router()


userRouter.get('/get-user-creation',auth,getUserCreations)
userRouter.get('/get-publish-creations',auth,getPublicCreations)
userRouter.post('/toggle-like-creation',auth,toggleLikeCreations)

export default userRouter