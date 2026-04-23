import { collectionItems } from "@/lib/data";
import { notFound } from "next/navigation";
import ClientProductPage from "./ClientProductPage";

export async function generateStaticParams() {
  return collectionItems.map((item) => ({
    slug: item.slug,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = collectionItems.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return <ClientProductPage product={product} />;
}
