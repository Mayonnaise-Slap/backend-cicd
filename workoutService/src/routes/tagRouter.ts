import {Router} from 'express';
import {paginate} from "../utils/paginate";
import {AppDataSource} from "../data-source";
import {Tag} from "../models/tag.entity";


const router = Router();
const tagRepo = AppDataSource.getRepository(Tag);


router.get("/", async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page as string) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit as string) || 10, 1);
        const search = (req.query.search as string) || "";

        const qb = tagRepo
            .createQueryBuilder("tag")
        if (search) {
            qb.where("tag.tag ILIKE :search", { search: `%${search}%` });
        }

        const result = await paginate(qb, page, limit, "tag");
        return res.json(result);

    } catch (err) {
        console.error("Error fetching tags:", err);
        return res.status(500).json({ message: "Failed to fetch tags" });
    }
});

export default router;