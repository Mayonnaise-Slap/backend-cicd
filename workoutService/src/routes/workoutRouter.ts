import {Router} from 'express';
import {paginate} from "../utils/paginate";
import {Workout} from "../models/workout.entity";
import {AppDataSource} from "../data-source";
import {authMiddleware, AuthRequest} from "../middlewares/auth.middleware";
import {Tag} from "../models/tag.entity";
import {In} from "typeorm";


const router = Router();
const workoutRepo = AppDataSource.getRepository(Workout);
const tagRepo = AppDataSource.getRepository(Tag);


router.get("/", async (req, res) => {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);

    const result = await paginate(workoutRepo, page, limit, "workout");
    return res.json(result);
});

router.get("/mine", authMiddleware, async (req: AuthRequest, res) => {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);

    const qb = workoutRepo.createQueryBuilder("workout");

    if (!req.user) {
        console.error("User not found after a authMiddleware, ???\n" + req);
        return res.status(400).send("User not found");
    }

    qb.where("workout.author_id = :author_id", {author_id: req.user!.id});
    const result = await paginate(qb, page, limit);
    return res.json(result);
})

router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const workout = await workoutRepo.findOne({
            where: {id},
            relations: ["tags"],
        });

        if (!workout) {
            return res.status(404).json({message: "Workout not found"});
        }

        return res.json(workout);
    } catch (err) {
        console.error("Error fetching workout:", err);
        return res.status(500).json({message: "Failed to fetch workout"});
    }
});

router.post("/", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const {title, elements, tags} = req.body as {
            title: string;
            elements: any[];
            tags: number[];
        };

        const tagEntities = await tagRepo.find({
                where: {id: In(tags)}
            }
        );

        if (tagEntities.length !== tags.length) {
            return res.status(400).json({message: "One or more tags not found"});
        }

        const workout = workoutRepo.create({
            title,
            elements,
            tags: tagEntities,
            author_id: req.user!.id,
        });

        await workoutRepo.save(workout);

        return res.status(201).json(workout);
    } catch (err: any) {
        console.error("Error creating workout:", err);
        return res.status(500).json({message: "Failed to create workout"});
    }
});

router.put("/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);

        console.log(id);

        const workout = await workoutRepo.findOne({
            where: {id: id},
            relations: ["tags"],
        });

        console.log(workout);

        if (!workout) {
            return res.status(404).json({message: "Workout not found"});
        }

        if (workout.author_id !== req.user!.id) {
            return res.status(403).json({message: "Forbidden: not your workout"});
        }

        const {title, elements, tags} = req.body as {
            title?: string;
            elements?: any[];
            tags?: number[];
        };

        if (title !== undefined) workout.title = title;
        if (elements !== undefined) workout.elements = elements;

        if (tags) {
            const tagEntities = await tagRepo.find({where: {id: In(tags)}});
            if (tagEntities.length !== tags.length) {
                return res.status(400).json({message: "One or more tags not found"});
            }
            workout.tags = tagEntities;
        }

        await workoutRepo.save(workout);

        return res.json(workout);
    } catch (err: any) {
        console.error("Error updating workout:", err);
        return res.status(500).json({message: "Failed to update workout"});
    }
});

router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
    try {
        const id = parseInt(req.params.id);

        const workout = await workoutRepo.findOne({
            where: {id: id},
        });
        if (!workout) {
            return res.status(404).json({message: "Workout not found"});
        }

        if (workout.author_id !== req.user!.id) {
            return res.status(403).json({message: "Forbidden: not your workout"});
        }

        await workoutRepo.remove(workout);
        return res.status(204).send();
    } catch (err: any) {
        console.error("Error deleting workout:", err);
        return res.status(500).json({message: "Failed to delete workout"});
    }
});

export default router;