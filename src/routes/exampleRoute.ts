import { Router } from "express";
import { getExamples, postExample, getExampleById } from "../controllers/exampleController";

const router = Router();

router.get("/", getExamples);
router.post("/", postExample);
router.get(":id", getExampleById);

export default router;
