import { FieldError } from "../generated/graphql";

// converts errors from api call into map for frontend to use
export const toErrorMap = (errors: FieldError[]) => {
    const errorMap: Record<string, string> = {};
    errors.forEach(({field, message}) => {
        errorMap[field] = message;
    })
    return errorMap;
}