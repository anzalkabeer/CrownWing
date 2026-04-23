require('dotenv').config();
const { MongoClient } = require('mongodb');

// This matches lib/data.ts exactly
const collectionItems = [
  {
    id: 1,
    name: "Pumpkin Sofa (White)",
    slug: "pumpkin-sofa-white",
    description: "Minimalist design for your daily brew.",
    price: "Rs.18,999",
    image: "/products/pumpkin-sofa-white/product-1.png",
  },
  {
    id: 2,
    name: "Modern 3-Seater Sofa (Emrald Green)",
    slug: "modern-3-seater-emerald",
    description: "Ergonomic seating with premium upholstery.",
    price: "Rs.19,999",
    image: "/products/modern-3-seater-emerald/product-2.png",
  },
  {
    id: 3,
    name: "Curved Sofa for Living Room - Modern Boucle Modular Sectional Set, 4 Seat Upholstered Couch for Bedroom, Home Office (Beige, 4 Seater)",
    slug: "curved-boucle-sectional-beige",
    description: "Sculptured for a bold statement.",
    price: "Rs.26,999",
    image: "/products/curved-boucle-sectional-beige/product-3.png",
  },
  {
    id: 4,
    name: "Old-Money Leather Finish Wooden Rocking Chair",
    slug: "leather-finish-rocking-chair",
    description: "Plush wooden seating with gold accents.",
    price: "Rs.49,999",
    image: "/products/leather-finish-rocking-chair/product-4.png",
  },
  {
    id: 5,
    name: "Pumkin Sofa (Blue)",
    slug: "pumpkin-sofa-blue",
    description: "Minimalist design for your daily brew.",
    price: "Rs.18,999",
    image: "/products/pumpkin-sofa-blue/product-5.png",
  },
  {
    id: 6,
    name: "Azure Solid Wood Frame Indoor Chaise (Pink)",
    slug: "azure-solid-wood-chaise-pink",
    description: "Classic Sofa/Bed Cushioned with Premium Fabric.",
    price: "Rs.36,999",
    image: "/products/azure-solid-wood-chaise-pink/product-6.png",
  },
  {
    id: 7,
    name: "Modern 3-Seater Sofa, Boucle Fabric, Curved Arms, Walnut Wooden Legs, (Beige, 3 Seater)",
    slug: "modern-3-seater-boucle-beige",
    description: "Premium comfort and modern design.",
    price: "Rs.23,990",
    image: "/products/modern-3-seater-boucle-beige/3-seater Sofa(biege).jpg",
  },
  {
    id: 8,
    name: "curved velvet mordern style low height 3-Seater Sofa",
    slug: "curved-velvet-low-height",
    description: "Plush velvet finishing with low profile silhouette.",
    price: "Rs.18,500",
    image: "/products/curved-velvet-low-height/product-7.jpg",
  }
];

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB for seeding...");
    
    const db = client.db('crownwing');
    const productsCollection = db.collection('products');
    
    const count = await productsCollection.countDocuments();
    if (count > 0) {
      console.log("Database already seeded with " + count + " products.");
      return;
    }
    
    const result = await productsCollection.insertMany(collectionItems);
    console.log(`Successfully seeded ${result.insertedCount} products into MongoDB!`);
    
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.close();
  }
}

run();
