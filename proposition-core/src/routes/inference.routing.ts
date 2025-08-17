import express from "express";
import type { Response, Request } from 'express';
import { verificarInferencia } from "../services/openai.service";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { premisas, conclusion, reglas } = req.body;

    if (!premisas || !conclusion || !reglas) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    const resultado = await verificarInferencia(premisas, conclusion, reglas);

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error en /verificar-inferencia:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

export default router;
