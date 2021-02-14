import express from "express";
import { testRoute } from './Routes/testRoutes'

const app = express();

app.use(express.json());
app.use('/test', testRoute)

export default app;