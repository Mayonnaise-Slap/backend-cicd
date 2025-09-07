import express, {response} from "express";
import {Like} from "../models/like.entity";
import {AppDataSource} from "../data-source";
import axios from "axios";
import {authMiddleware, AuthRequest} from "../middlewares/auth.middleware";

const router = express.Router();
const likeRepo = AppDataSource.getRepository(Like);

router.get('/posts/:postId', async (req, res) => {
    const postId = parseInt(req.params.postId)

    if (!postId) {
        return res.status(404).json({ message: "Post not found" });
    }

    try {
        const response = await axios.get(
            `http://workout:5000/post/${parseInt(req.params.postId)}`
        )

        if (response.status !== 200) {
            return res.status(404).json({ message: "Post not found" });
        }
    } catch (err: any) {
        console.error("error requesting workout:", err.response?.data || err.message);
        return res.status(500).json({ message: "unknown error" });
    }

    return res.status(200).json((await likeRepo.find({where: {workoutId: postId}})).length);
})

router.post('/posts/:postId', authMiddleware, async (req: AuthRequest, res) => {
    const postId = parseInt(req.params.postId)

    if (!postId) {
        return res.status(404).json({ message: "Post not found" });
    }

    try {
        const response = await axios.get(
            `http://workout:5000/post/${parseInt(req.params.postId)}`
        )

        if (response.status !== 200) {
            return res.status(404).json({ message: "Post not found" });
        }
    } catch (err: any) {
        console.error("error requesting workout:", err.response?.data || err.message);
        return res.status(500).json({ message: "unknown error" });
    }


    const userLike = await likeRepo.find({where: {workoutId: postId, userId: req.user!.id}})

    if (userLike.length === 0) {
        likeRepo.create({workoutId: postId, userId: req.user!.id})
        return res.status(201).json(true);
    }
    await likeRepo.delete({workoutId: postId, userId: req.user!.id})

    return res.status(201).json(false);
})


router.get('/posts/:postId/me', authMiddleware, async (req: AuthRequest, res) => {
    const postId = parseInt(req.params.postId)

    if (!postId) {
        return res.status(404).json({ message: "Post not found" });
    }

    try {
        const response = await axios.get(
            `http://workout:5000/post/${parseInt(req.params.postId)}`
        )

        if (response.status !== 200) {
            return res.status(404).json({ message: "Post not found" });
        }
    } catch (err: any) {
        console.error("error requesting workout:", err.response?.data || err.message);
        return res.status(500).json({ message: "unknown error" });
    }

    const userLike = await likeRepo.find({where: {workoutId: postId, userId: req.user!.id}})

    if (userLike.length === 0) {
        return res.status(201).json(false);
    }
    return res.status(201).json(true);
})

export default router;
