import { Response } from "express";
import log from "../loggers";

const handleError = async (res: Response, err: any): Promise<Response> => {
  if (!err)
    return res.status(400).send({ error: "Something went wrong, oops!" });
  if (err.message) {
    log.error(err);
    if (err.code)
      return res.status(400).send({ error: err.message, code: err.code });
    return res.status(400).send({ error: err.message });
  }
  return res.status(400).send({ error: `${err}` });
};

export { handleError };
