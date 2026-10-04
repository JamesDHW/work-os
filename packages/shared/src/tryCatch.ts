import { toWorkOsError, type WorkOsError } from "./WorkOsError.ts";

export const tryCatch = <Value>(operation: () => Value): Value | WorkOsError => {
  try {
    return operation();
    // oxlint-disable-next-line architecture/no-raw-exceptions -- tryCatch is the one place that converts thrown values into WorkOsError.
  } catch (thrown) {
    return toWorkOsError(thrown);
  }
};

export const tryCatchAsync = async <Value>(operation: () => Promise<Value>): Promise<Value | WorkOsError> => {
  try {
    return await operation();
    // oxlint-disable-next-line architecture/no-raw-exceptions -- tryCatchAsync is the one place that converts rejections into WorkOsError.
  } catch (thrown) {
    return toWorkOsError(thrown);
  }
};
