import { addProduct, getAllProducts } from "./services/productService.js";

const test = async () => {
  console.log("🧪 Testing Firebase connection...");

  // add a sample product
  await addProduct({
    name: "Test Apple",
    price: 120,
    category: "Fruits",
  });

  // fetch all products and print them
  const products = await getAllProducts();
  console.log("✅ Products fetched:", products);
};

test();