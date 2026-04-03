// scripts/generate-swagger-json.ts
import fs from "fs";
import path from "path";
import { swaggerSpec } from "../app/config/swagger";

const outputPath = path.resolve(__dirname, "../swagger.json");

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ Swagger JSON generated at ${outputPath}`);
