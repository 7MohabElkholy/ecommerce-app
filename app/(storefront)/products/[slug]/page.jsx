import React from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Card from "@/components/Card";

async function getProduct(slug) {
  const supabase = createClientComponentClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories (name, slug)
    `
    )
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return product;
}

async function getRelatedProducts(categoryId, currentProductId) {
  const supabase = createClientComponentClient();

  const { data: relatedProducts, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories (name)
    `
    )
    .eq("category_id", categoryId)
    .neq("id", currentProductId)
    .limit(4)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching related products:", error);
    return [];
  }

  return relatedProducts;
}

export default async function ProductPage({ params }) {
  const { slug } = params;
  const product = await getProduct(slug);

  let relatedProducts = [];
  if (product) {
    relatedProducts = await getRelatedProducts(product.category_id, product.id);
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-2xl shadow-sm p-8 max-w-md w-full">
          <FeatherIcon
            name="package"
            size={48}
            className="text-gray-400 mx-auto mb-4"
          />
          <h1 className="font-[tajawal] text-2xl font-bold text-gray-800 mb-3">
            المنتج غير موجود
          </h1>
          <p className="font-[tajawal] text-gray-600 mb-6">
            عذراً، لم يتم العثور على المنتج الذي تبحث عنه.
          </p>
          <a
            href="/products"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-[tajawal] font-medium transition-colors duration-300 inline-block"
          >
            تصفح المنتجات
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex justify-end mb-8">
          <ol className="flex items-center gap-2 font-[tajawal] text-sm text-gray-600">
            <li>
              <a
                href="/"
                className="hover:text-blue-500 transition-colors duration-200"
              >
                الرئيسية
              </a>
            </li>
            <li>
              <FeatherIcon
                name="chevron-left"
                size={14}
                className="text-gray-400"
              />
            </li>
            <li>
              <a
                href="/products"
                className="hover:text-blue-500 transition-colors duration-200"
              >
                المنتجات
              </a>
            </li>
            <li>
              <FeatherIcon
                name="chevron-left"
                size={14}
                className="text-gray-400"
              />
            </li>
            <li className="text-blue-500 font-medium">{product.title}</li>
          </ol>
        </nav>

        {/* Product Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square group">
                <img
                  src={product.thumbnail_url || "/placeholder-image.jpg"}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  {product.is_new && (
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-[tajawal] font-medium shadow-md">
                      جديد
                    </span>
                  )}
                  {product.is_hot && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-[tajawal] font-medium shadow-md">
                      مميز
                    </span>
                  )}
                  {!product.in_stock && (
                    <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-[tajawal] font-medium shadow-md">
                      نفذت الكمية
                    </span>
                  )}
                </div>
              </div>

              {/* Gallery */}
              {product.gallery && product.gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.gallery.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all duration-200 group"
                    >
                      <img
                        src={image}
                        alt={`${product.title} - صورة ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category */}
              <div className="flex items-center justify-end gap-2">
                <a
                  href={`/categories/${product.categories?.slug}`}
                  className="font-[tajawal] text-sm text-blue-500 hover:text-blue-600 transition-colors duration-200"
                >
                  {product.categories?.name}
                </a>
                <FeatherIcon name="tag" size={16} className="text-gray-400" />
              </div>

              {/* Title */}
              <h1 className="font-[tajawal] text-3xl font-bold text-gray-900 text-right leading-tight">
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-center justify-end gap-3">
                <span className="font-[tajawal] text-2xl font-bold text-blue-600">
                  {product.price?.toLocaleString()} ر.س
                </span>
                {product.in_stock ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-[tajawal] font-medium">
                    ✓ متوفر
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-[tajawal] font-medium">
                    ✗ غير متوفر
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-[tajawal] text-lg font-semibold text-gray-800 text-right">
                  الوصف
                </h3>
                <p className="font-[tajawal] text-gray-600 leading-relaxed text-right">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4">
                {product.in_stock ? (
                  <>
                    <div className="flex items-center justify-end gap-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200">
                          <FeatherIcon name="minus" size={16} />
                        </button>
                        <span className="px-4 font-[tajawal] font-medium text-gray-800 min-w-[3rem] text-center">
                          1
                        </span>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200">
                          <FeatherIcon name="plus" size={16} />
                        </button>
                      </div>

                      <span className="font-[tajawal] text-sm text-gray-600">
                        الكمية
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-[tajawal] font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2">
                        <FeatherIcon name="shopping-cart" size={18} />
                        أضف إلى السلة
                      </button>
                      <button className="p-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-red-500 transition-colors duration-200">
                        <FeatherIcon name="heart" size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <FeatherIcon
                      name="x-circle"
                      size={32}
                      className="text-gray-400 mx-auto mb-2"
                    />
                    <p className="font-[tajawal] text-gray-600 mb-3">
                      هذا المنتج غير متوفر حالياً
                    </p>
                    <button className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-[tajawal] font-medium cursor-not-allowed">
                      غير متوفر
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="text-right">
                    <span className="font-[tajawal] text-gray-600 block mb-1">
                      رقم المنتج:
                    </span>
                    <span className="font-[tajawal] font-medium text-gray-800">
                      #{product.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-[tajawal] text-gray-600 block mb-1">
                      التصنيف:
                    </span>
                    <span className="font-[tajawal] font-medium text-gray-800">
                      {product.categories?.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-[tajawal] text-gray-600 block mb-1">
                      الحالة:
                    </span>
                    <span className="font-[tajawal] font-medium text-gray-800">
                      {product.in_stock ? "متوفر" : "غير متوفر"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-[tajawal] text-gray-600 block mb-1">
                      تاريخ الإضافة:
                    </span>
                    <span className="font-[tajawal] font-medium text-gray-800">
                      {new Date(product.created_at).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[tajawal] text-xl font-bold text-gray-800">
                منتجات ذات صلة
              </h2>
              <a
                href={`/categories/${product.categories?.slug}`}
                className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-[tajawal] text-sm transition-colors duration-200"
              >
                عرض الكل
                <FeatherIcon name="arrow-left" size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  title={relatedProduct.title}
                  description={relatedProduct.description}
                  price={relatedProduct.price}
                  image={relatedProduct.thumbnail_url}
                  isNew={relatedProduct.is_new}
                  isHot={relatedProduct.is_hot}
                  inStock={relatedProduct.in_stock}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
