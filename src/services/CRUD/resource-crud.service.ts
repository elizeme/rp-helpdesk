import { string } from "yup";
import { advancedResults } from "../CRUD/advancedResults.service";

export const getAllResources = async (
  model: any,
  queryParams: any,
  populate: any
) => {
  const resource = await advancedResults(model, null, queryParams, populate);
  return resource;
};

export const createResource = async (model: any, input: any) => {
  const resource = await model.create(input);
  return resource;
};

export const getResourceById = async (
  model: any,
  id: string,
  queryParams: any,
  populate: any
) => {
  const resource = await advancedResults(model, id, queryParams, populate);
  return resource;
};

export const deleteResourceById = async (model: any, id: string) => {
  const resource = await model.findById(id).exec();

  if (!resource) {
    return null;
  }

  resource.remove();
  return resource;
};

export const updateResourceById = async (
  model: any,
  id: string,
  updateDetails: any
) => {
  const resource = await model.findById(id).exec();

  if (!resource) {
    return null;
  }

  const updatedResource = await resource.findByIdAndUpdate(id, updateDetails, {
    new: true,
    runValidators: true,
  });

  return updatedResource;
};
