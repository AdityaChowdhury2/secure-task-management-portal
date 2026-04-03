// handle mongoose validation error

// import { Error } from "mongoose";
// import { TErrorSource, TGenericErrorResponse } from "../interface/Error";

// const handleValidationError = (
//   error: Error.ValidationError
// ): TGenericErrorResponse => {
//   const errorSources: TErrorSource[] = Object.values(error.errors).map(
//     (err: Error.ValidatorError | Error.CastError) => {
//       return { path: err.path, message: err.message };
//     }
//   );

//   const statusCode = 400;
//   return {
//     statusCode,
//     message: "Validation Error",
//     errorSources,
//   };
// };

// export default handleValidationError;
