import { Schema, model, models, type InferSchemaType, type HydratedDocument } from "mongoose";

export interface ProductInput {
  name: string;
  price: number;
  images: string[];
  description: string;
  stock: number;
}

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "price is required"],
      min: [0, "price must be a valid non-negative number"],
    },
    images: {
      type: [String],
      required: [true, "images is required"],
      validate: {
        validator: (value: string[]) =>
          Array.isArray(value) && value.length > 0 && value.every((img) => img.trim().length > 0),
        message: "images must contain only non-empty strings",
      },
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "stock is required"],
      min: [0, "stock must be a non-negative integer"],
      validate: {
        validator: Number.isInteger,
        message: "stock must be a non-negative integer",
      },
    },
  },
  {
    timestamps: true,
  }
);

export type Product = InferSchemaType<typeof productSchema>;
export type ProductDocument = HydratedDocument<Product>;

export const ProductModel = models.Product || model("Product", productSchema);

export function validateProductInput(input: Partial<ProductInput>): string[] {
  const errors: string[] = [];

  if (!input.name || input.name.trim().length === 0) {
    errors.push("name is required");
  }

  if (typeof input.price !== "number" || Number.isNaN(input.price) || input.price < 0) {
    errors.push("price must be a valid non-negative number");
  }

  if (!Array.isArray(input.images) || input.images.length === 0) {
    errors.push("images must be a non-empty array");
  } else if (input.images.some((img) => typeof img !== "string" || img.trim().length === 0)) {
    errors.push("images must contain only non-empty strings");
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.push("description is required");
  }

  if (!Number.isInteger(input.stock) || (input.stock ?? -1) < 0) {
    errors.push("stock must be a non-negative integer");
  }

  return errors;
}

export function toProductData(input: ProductInput): ProductInput {
  return {
    name: input.name.trim(),
    price: input.price,
    images: input.images,
    description: input.description.trim(),
    stock: input.stock,
  };
}
