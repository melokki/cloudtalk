export type UpdateProductRequest = {
  Params: {
    id: string;
  };
  Body: {
    name: string;
    description: string;
    price: number;
  };
};
