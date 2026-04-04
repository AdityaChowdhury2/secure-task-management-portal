"use strict";
/**
 * @openapi
 * components:
 *   schemas:
 *     TErrorSource:
 *       type: object
 *       required:
 *         - path
 *         - message
 *       properties:
 *         path:
 *           oneOf:
 *             - type: string
 *             - type: number
 *           description: The field (or array index) that caused the error
 *           example: "email"
 *         message:
 *           type: string
 *           description: A human‐readable error message for this field
 *           example: "Email is required"
 *
 *     TGenericErrorResponse:
 *       type: object
 *       required:
 *         - statusCode
 *         - message
 *         - errorSources
 *       properties:
 *         statusCode:
 *           type: integer
 *           format: int32
 *           description: HTTP status code of the error
 *           example: 400
 *         message:
 *           type: string
 *           description: A general error message
 *           example: "Validation Error"
 *         errorSources:
 *           type: array
 *           description: Field‐specific error details
 *           items:
 *             $ref: "#/components/schemas/TErrorSource"
 */
Object.defineProperty(exports, "__esModule", { value: true });
