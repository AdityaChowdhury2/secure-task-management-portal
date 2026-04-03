// swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Assignment API",
      version: "1.0.0",
      description: "API documentation for Assignment API",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/app/modules/**/*.ts",
    "./src/app/routes/**/*.ts",
    "./src/app/interface/**/*.ts",
  ],
  components: {
    schemas: ["./src/app/modules/**/*.swagger.ts"],
  },
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
