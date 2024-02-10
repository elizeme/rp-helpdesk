import e, { NextFunction, Request, Response } from "express";

export const advancedResults = async (
  model: any,
  id: any,
  queryParams: any,
  populate: any
) => {
  let query;

  // Copy queryParams
  const reqQuery = { ...queryParams };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  if (id) {
    query = model.findById(id);
  } else {
    query = model.find(JSON.parse(queryStr));
  }

  // Select Fields
  if (queryParams.select) {
    const fields = (queryParams.select as string).split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (queryParams.sort) {
    const sortBy = (queryParams.sort as string).split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = (queryParams.page || 1) as number;
  const limit = (queryParams.limit || 25) as number;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  let total;
  if (id) {
    total = await model.countDocuments({ _id: id });
  } else {
    total = await model.countDocuments(JSON.parse(queryStr));
  }

  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Executing query
  const results = await query;

  // Pagination result
  const pagination: any = {};

  if (endIndex < total) {
    pagination.next = {
      page: +page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: +page - 1,
      limit,
    };
  }

  return {
    success: true,
    count: results?.length || total,
    pagination,
    data: results,
  };
};
