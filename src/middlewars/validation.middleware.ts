import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../common/response";
import { ZodError, ZodType } from "zod";
import { GraphQLError } from "graphql";

type KeyRequestType = keyof Request; //جبت ال keysمن ال req
type schemaType = Partial<Record<KeyRequestType, ZodType>>; //عملت typeكل keyعنده schema optional

type IssuesType = {
  // type للمشاكل بتاعت كل key
  key: KeyRequestType;
  issues: {
    path: (string | number | symbol | undefined | null)[];
    message: string;
  }[];
};

export const validation = (schema: schemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const issues: IssuesType[] = [];

    for (const key of Object.keys(schema) as KeyRequestType[]) {
      if (!schema[key]) continue;
      const result = schema[key]?.safeParse(req[key]);
      console.log({ result });

      if (!result.success) {
        const errors = result.error as ZodError;
        issues.push({
          key,
          issues: errors.issues.map((err) => {
            return {
              path: err.path,
              message: err.message,
            };
          }),
        });
      }
    }

    console.log({ issues });
    if (issues.length > 0) {
      throw new BadRequestException("validation Error", {
        issues,
      });
    }

    next();
  };
};

export const GQLValidation = <T>(schema: ZodType, args: T) => {
  const result = schema.safeParse(args);
  const errors = result.error as ZodError;

  if (!result.success) {
    throw new GraphQLError("validation Error", {
      extensions: {
        cause: errors.issues.map((err) => {
          return {
            path: err.path,
            message: err.message,
          };
        }),
      },
    });
  }
};
