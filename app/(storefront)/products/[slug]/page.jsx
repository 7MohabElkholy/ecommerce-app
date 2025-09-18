"use client";
import React, { useState, useEffect, useRef } from "react";
import FeatherIcon from "@/components/FeatherIcon";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Card from "@/components/Card";

/**
 * A modal component for displaying a gallery of images.
 *
 * @param {object} props - The properties for the component.
 * @param {string[]} props.images - An array of image URLs.
 * @param {number} props.currentIndex - The index of the currently displayed image.
 * @param {Function} props.onClose - A function to close the modal.
 * @param {Function} props.onNavigate - A function to navigate between images.
 * @returns {React.ReactElement} The gallery modal component.
 */
function GalleryModal({ images, currentIndex, onClose, onNavigate }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";

    // Prevent text selection globally while modal is open
    const preventSelection = (e) => e.preventDefault();
    document.addEventListener("selectstart", preventSelection);

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("selectstart", preventSelection);
    };
  }, []);

  /**
   * Handles clicks on the image.
   *
   * @param {React.MouseEvent<HTMLImageElement>} e - The mouse event.
   */
  const handleImageClick = (e) => {
    // Reset zoom on double click
    if (e.detail === 2) {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  /**
   * Handles the mouse wheel event for zooming.
   *
   * @param {React.WheelEvent<HTMLDivElement>} e - The wheel event.
   */
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newZoomLevel = Math.max(0.5, Math.min(5, zoomLevel + delta));

    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setZoomLevel(newZoomLevel);

      // Adjust position to zoom towards cursor
      if (newZoomLevel > 1) {
        const scaleChange = newZoomLevel - zoomLevel;
        setPosition((prev) => ({
          x: prev.x - x * scaleChange,
          y: prev.y - y * scaleChange,
        }));
      }
    }
  };

  /**
   * Handles the mouse down event for dragging.
   *
   * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
   */
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      e.preventDefault(); // Prevent text selection
      setIsDragging(true);
      setStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });

      // Add user-select none to prevent selection
      if (containerRef.current) {
        containerRef.current.style.userSelect = "none";
      }
    }
  };

  /**
   * Handles the mouse move event for dragging.
   *
   * @param {React.MouseEvent<HTMLDivElement>} e - The mouse event.
   */
  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault(); // Prevent text selection
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      });
    }
  };

  /**
   * Handles the mouse up event for dragging.
   */
  const handleMouseUp = () => {
    setIsDragging(false);

    // Restore user-select
    if (containerRef.current) {
      containerRef.current.style.userSelect = "";
    }
  };

  /**
   * Handles zooming in.
   */
  const handleZoomIn = () => {
    const newZoomLevel = Math.min(5, zoomLevel + 0.5);
    setZoomLevel(newZoomLevel);

    // Center zoom if not already zoomed
    if (zoomLevel === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  /**
   * Handles zooming out.
   */
  const handleZoomOut = () => {
    const newZoomLevel = Math.max(0.5, zoomLevel - 0.5);
    setZoomLevel(newZoomLevel);

    // Reset position when fully zoomed out
    if (newZoomLevel === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  /**
   * Resets the zoom level and position.
   */
  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        onNavigate(currentIndex + 1);
      } else if (e.key === "0" || e.key === " ") {
        resetZoom();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        handleZoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, onClose, onNavigate]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 select-none"
      style={{ userSelect: "none" }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-all duration-200"
      >
        <FeatherIcon name="x" size={24} />
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 transition-all duration-200"
          >
            <FeatherIcon name="chevron-left" size={24} />
          </button>
          <button
            onClick={() => onNavigate(currentIndex + 1)}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 disabled:opacity-30 transition-all duration-200"
          >
            <FeatherIcon name="chevron-right" size={24} />
          </button>
        </>
      )}

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black bg-opacity-50 rounded-full p-2">
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.5}
          className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 disabled:opacity-30"
        >
          <FeatherIcon name="zoom-out" size={20} />
        </button>
        <button
          onClick={resetZoom}
          className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 text-xs font-medium"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= 5}
          className="p-1 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 disabled:opacity-30"
        >
          <FeatherIcon name="zoom-in" size={20} />
        </button>
      </div>

      {/* Image counter */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main image container */}
      <div
        className="relative w-full h-full max-w-4xl max-h-[80vh] overflow-hidden"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor:
            zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          userSelect: "none",
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
            userSelect: "none",
          }}
        >
          <img
            ref={imageRef}
            src={images[currentIndex]}
            alt={`Gallery image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${zoomLevel})`,
              transition: "transform 0.2s ease-out",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}
            onClick={handleImageClick}
            onDragStart={(e) => e.preventDefault()} // Prevent native drag behavior
          />
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2 max-w-full overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              className={`w-16 h-16 flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all duration-200 select-none ${
                index === currentIndex
                  ? "border-blue-500 ring-2 ring-blue-300"
                  : "border-transparent hover:border-gray-400"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover select-none"
                onDragStart={(e) => e.preventDefault()} // Prevent native drag behavior
              />
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs hidden md:block">
        <div>استخدم عجلة الماوس للتصغير/التكبير</div>
        <div>اضغط مطولاً وسحب للتحريك عند التكبير</div>
        <div>اضغط نقرتين لإعادة التعيين</div>
      </div>
    </div>
  );
}

/**
 * Fetches a product from the database by its slug.
 *
 * @param {string} slug - The slug of the product to fetch.
 * @returns {Promise<object|null>} A promise that resolves to the product object, or null if not found.
 */
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

/**
 * Fetches related products from the database.
 *
 * @param {number} categoryId - The ID of the category to fetch related products from.
 * @param {number} currentProductId - The ID of the current product to exclude from the results.
 * @returns {Promise<object[]>} A promise that resolves to an array of related products.
 */
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

/**
 * The product details page.
 *
 * This component displays the details of a single product, including its images,
 * price, description, and related products.
 *
 * @param {object} props - The properties for the component.
 * @param {object} props.params - The route parameters.
 * @param {string} props.params.slug - The slug of the product to display.
 * @returns {React.ReactElement} The product page component.
 */
export default function ProductPage({ params }) {
  const { slug } = params;
  const [product, setProduct] = React.useState(null);
  const [relatedProducts, setRelatedProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [galleryModal, setGalleryModal] = React.useState({
    isOpen: false,
    currentIndex: 0,
  });

  const [quantity, setQuantity] = React.useState(1); // Quantity state

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const productData = await getProduct(slug);
      setProduct(productData);

      if (productData) {
        const related = await getRelatedProducts(
          productData.category_id,
          productData.id
        );
        setRelatedProducts(related);
      }

      setLoading(false);
    }

    fetchData();
  }, [slug]);

  /**
   * Opens the gallery modal.
   *
   * @param {number} [index=0] - The index of the image to display initially.
   */
  const openGalleryModal = (index = 0) => {
    setGalleryModal({
      isOpen: true,
      currentIndex: index,
    });
  };

  /**
   * Closes the gallery modal.
   */
  const closeGalleryModal = () => {
    setGalleryModal({
      isOpen: false,
      currentIndex: 0,
    });
  };

  /**
   * Decreases the quantity of the product to be added to the cart.
   */
  const handleDecrease = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  /**
   * Increases the quantity of the product to be added to the cart.
   */
  const handleIncrease = () => {
    setQuantity((q) => Math.min(q + 1, product.quantity));
  };

  /**
   * Adds the product to the cart.
   */
  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex > -1) {
      if (cart[existingIndex].quantity + quantity > product.quantity) {
        alert("الكمية المطلوبة تتجاوز الكمية المتوفرة في المخزون.");
        return;
      }
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail_url: product.thumbnail_url,
        quantity,
        maxQuantity: product.quantity,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    // Optionally, show a success message or redirect to cart
  };

  /**
   * Navigates to a specific image in the gallery.
   *
   * @param {number} index - The index of the image to navigate to.
   */
  const navigateGallery = (index) => {
    setGalleryModal((prev) => ({
      ...prev,
      currentIndex: index,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
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

  // Combine thumbnail with gallery images
  const allImages = [product.thumbnail_url, ...(product.gallery || [])].filter(
    Boolean
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {galleryModal.isOpen && (
        <GalleryModal
          images={allImages}
          currentIndex={galleryModal.currentIndex}
          onClose={closeGalleryModal}
          onNavigate={navigateGallery}
        />
      )}

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
              <div
                className="relative bg-gray-100 rounded-xl overflow-hidden aspect-square group cursor-zoom-in"
                onClick={() => openGalleryModal(0)}
              >
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
                {/* View all images button */}
                {allImages.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openGalleryModal(0);
                    }}
                    className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm font-[tajawal] hover:bg-opacity-80 transition-colors duration-200"
                  >
                    عرض جميع الصور ({allImages.length})
                  </button>
                )}
              </div>

              {/* Gallery Thumbnails */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {allImages.slice(0, 8).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all duration-200 group relative"
                      onClick={() => openGalleryModal(index)}
                    >
                      <img
                        src={image}
                        alt={`${product.title} - صورة ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Show more indicator for additional images */}
                      {index === 7 && allImages.length > 8 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                          <span className="text-white font-[tajawal] text-sm font-medium">
                            +{allImages.length - 8}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category */}
              {/* <div className="flex items-center justify-end gap-2">
                <a
                  href={`/categories/${product.categories?.slug}`}
                  className="font-[tajawal] text-sm text-blue-500 hover:text-blue-600 transition-colors duration-200"
                >
                  {product.categories?.name}
                </a>
                <FeatherIcon name="tag" size={16} className="text-gray-400" />
              </div> */}

              {/* Title */}
              <h1 className="font-[tajawal] text-3xl font-bold text-gray-900 text-right leading-tight">
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-center justify-end gap-3">
                <span className="font-[tajawal] text-2xl font-bold text-blue-600">
                  ج.م {product.price?.toLocaleString()}
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
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                          onClick={handleDecrease}
                          disabled={quantity <= 1}
                        >
                          <FeatherIcon name="minus" size={16} />
                        </button>
                        <span className="px-4 font-[tajawal] font-medium text-gray-800 min-w-[3rem] text-center">
                          {quantity}
                        </span>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                          onClick={handleIncrease}
                        >
                          <FeatherIcon name="plus" size={16} />
                        </button>
                      </div>
                      <span className="font-[tajawal] text-sm text-gray-600">
                        الكمية
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={addToCart}
                        className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-[tajawal] font-medium hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <FeatherIcon
                          name="shopping-cart"
                          size={18}
                          className="flex items-center justify-center"
                        />
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
                <Card key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
