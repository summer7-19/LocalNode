import { JwtPayload } from "jsonwebtoken"; 
import { AuthPayload } from "./auth";
import { ValidateData } from "./validate";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      validated:ValidateData
    }
  }
}
export {};