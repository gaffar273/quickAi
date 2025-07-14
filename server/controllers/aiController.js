import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from 'cloudinary'
import connectCloudinary from "../configs/cloudinary.js";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import FormData from 'form-data'
import axios from 'axios'

const AI = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});
//generate article
export const generateArticle = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { prompt, length } = req.body
        const plan = req.plan
        const free_usage = req.free_usage

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached.Upgrade to premium ..." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [

                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: length
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations(user_id,prompt,content,type) VALUES(${userId},${prompt},${content},'article')`

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }
        res.json({ success: true, content })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}
//fn to geneerate blog title

export const generateBlogTitle = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { prompt } = req.body
        const plan = req.plan
        const free_usage = req.free_usage

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: "Limit reached.Upgrade to premium ..." })
        }

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            temperature: 0.7,
            max_tokens: 100
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations(user_id,prompt,content,type) VALUES(${userId},${prompt},${content},'blog-article')`

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: {
                    free_usage: free_usage + 1
                }
            })
        }
        res.json({ success: true, content })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}
//function to generate image

export const generateImage = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { prompt, publish } = req.body
        const plan = req.plan


        if (plan !== 'premium') {
            return res.json({ success: false, message: "Limit reached.Upgrade to premium ..." })
        }

        const formData = new FormData()
        formData.append('prompt', prompt)
        const { data } = await axios.post("https://clipdrop-api.co/text-to-image/v1", formData, {
            headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
            responseType: "arraybuffer"
        })

        const base64Img = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`

        const { secure_url } = await cloudinary.uploader.upload(base64Img)

        await sql` INSERT INTO creations(user_id,prompt,content,type,publish) VALUES(${userId},${prompt},${secure_url},'image',${publish ?? false})`


        res.json({ success: true, content: secure_url })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

//remove bg fn
/*
export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth()
        const  image  = req.file
        const plan = req.plan


        if (plan !== 'premium') {
            return res.json({ success: false, message: "Limit reached.Upgrade to premium ..." })
        }

        const { secure_url } = await cloudinary.uploader.upload(image.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        })

        await sql` INSERT INTO creations(user_id,prompt,content,type) VALUES(${userId},'Remove background from image',${secure_url},'image')`

        res.json({ success: true, content: secure_url })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}
*/

export const removeImageBackground = async (req, res) => {
    try {
        const { userId } = req.auth()
        const uploadedFile = req.file // Multer puts the file object directly on req.file

        const plan = req.plan

        // Add a check to ensure a file was uploaded
        if (!uploadedFile) {
            return res.json({ success: false, message: "No image file provided for background removal." });
        }

        // --- DEBUGGING STEP 1: Log the full uploadedFile object ---
        console.log("Multer uploaded file object:", uploadedFile);
        // --- DEBUGGING STEP 2: Log the path Multer provided ---
        console.log("Multer file path:", uploadedFile.path);


        if (plan !== 'premium') {
            return res.json({ success: false, message: "Limit reached.Upgrade to premium ..." })
        }

        // Ensure Cloudinary is connected (if not done globally at app startup)
        connectCloudinary();

        const { secure_url } = await cloudinary.uploader.upload(uploadedFile.path, {
            transformation: [
                {
                    effect: 'background_removal',
                    background_removal: 'remove_the_background'
                }
            ]
        })

        await sql` INSERT INTO creations(user_id,prompt,content,type) VALUES(${userId},'Remove background from image',${secure_url},'image')`

        res.json({ success: true, content: secure_url })

    } catch (error) {
        console.error("Error in removeImageBackground:", error.message)
        res.json({ success: false, message: error.message })
    }
}

// remove image object

export const removeImageObject = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { object } = req.auth()
        const image  = req.file
        const plan = req.plan


        if (plan !== 'premium') {
            return res.json({ success: false, message: "Limit reached.Upgrade to premium ..." })
        }

        const { public_id } = await cloudinary.uploader.upload(image.path)

        const imageUrl = await cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:${object}` }],
            resource_type: 'image'
        })

        await sql` INSERT INTO creations(user_id,prompt,content,type) VALUES(${userId},${`Remove ${object} from image`},${imageUrl},'image')`

        res.json({ success: true, content: imageUrl })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

//

export const resumeReview = async (req, res) => {
    try {
        const { userId } = req.auth()
        const resume = req.file
        const plan = req.plan


        if (plan !== 'premium') {
            return res.json({ success: false, message: "Limit reached.Upgrade to premium ..." })
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: "File is more than 5 mb..." })
        }

        const dataBuffer = fs.readFileSync(resume.path)
        const pdfData = await pdf(dataBuffer)


        const prompt = `Review the following resume and provide constructive feedback on it's strengths,weakness, and arwas for improvement. Resume Content:\n\n${pdfData}`

        const response = await AI.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const content = response.choices[0].message.content

        await sql` INSERT INTO creations(user_id,prompt,content,type) VALUES(${userId},'Review the uploaded resume',${content},'resume-review')`

        res.json({ success: true, content: content })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}