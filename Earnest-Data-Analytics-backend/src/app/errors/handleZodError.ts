import { ZodIssue, ZodError } from "zod";
import { TErrorSource, TGenericErrorResponse } from "../interface/Error";

const handleZodError = (error: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSource[] = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorSources,
  };
};

export default handleZodError;
