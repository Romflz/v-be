import { Request, Response } from "express";
import { listUsers, createUser, getUserById } from "../models/exampleModel";

export async function getExamples(req: Request, res: Response) {
  const examples = await listUsers();
  res.json(examples);
}

export async function postExample(req: Request, res: Response) {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: "name required" });
  const user = await createUser({ name });
  res.status(201).json(user);
}

export async function getExampleById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "invalid id" });
  const user = await getUserById(id);
  if (!user) return res.status(404).json({ error: "not found" });
  res.json(user);
}
