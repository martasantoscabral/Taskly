import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import subTaskRoutes from "./routes/subTaskRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import conflictRoutes from "./routes/conflictRoutes.js";
import mergeRoutes from "./routes/mergeRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import followerRoutes from "./routes/followerRoutes.js";
import feedRoutes from "./routes/feedRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import weatherRoutes from "./routes/weatherRoute.js";
import taskAiRoutes from "./routes/taskAiRoutes.js";

import { specs } from "./lib/swagger.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Configuração base
|--------------------------------------------------------------------------
*/

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Segurança
|--------------------------------------------------------------------------
*/

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5500",

  // Coloca aqui o endereço do GitHub Pages:
  "https://TEU-UTILIZADOR.github.io",

  // Ou lê o endereço guardado no Render:
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      /*
       * Pedidos sem origin, como Swagger, Postman ou curl,
       * também são permitidos.
       */
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },

    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  }),
);

/*
|--------------------------------------------------------------------------
| Swagger
|--------------------------------------------------------------------------
|
| Fica antes do rate limiter para a documentação não ser bloqueada.
|
*/

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs),
);

/*
|--------------------------------------------------------------------------
| Rate limiting
|--------------------------------------------------------------------------
*/

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    error:
      "Demasiados pedidos a partir deste IP. Tente novamente mais tarde.",
  },
});

app.use("/api", limiter);

/*
|--------------------------------------------------------------------------
| Rota de teste
|--------------------------------------------------------------------------
|
| Permite verificar facilmente se o backend está ativo no Render.
|
*/

app.get("/", (_req, res) => {
  res.status(200).json({
    name: "Taskly API",
    status: "online",
    documentation: "/api-docs",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| Rotas da API
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/users", followerRoutes);
app.use("/api/users", userRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/conflicts", conflictRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/groups", groupRoutes);

app.use("/api/tasks/ai", taskAiRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/api/tasks", subTaskRoutes);
app.use("/api/tasks", submissionRoutes);
app.use("/api/tasks", mergeRoutes);

app.use("/api/merges", mergeRoutes);
app.use("/api/weather", weatherRoutes);

/*
|--------------------------------------------------------------------------
| Rota não encontrada
|--------------------------------------------------------------------------
*/

app.use((_req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
  });
});

/*
|--------------------------------------------------------------------------
| Tratamento global de erros
|--------------------------------------------------------------------------
*/

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);

    res.status(500).json({
      error: "Erro interno do servidor",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  },
);

/*
|--------------------------------------------------------------------------
| Inicialização do servidor
|--------------------------------------------------------------------------
*/

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Taskly API running on port ${PORT}`);
});