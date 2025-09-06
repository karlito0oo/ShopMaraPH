import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { SettingService } from "../../services/SettingService";
import { HeroCarouselApi } from "../../services/ApiService";
import Toast from "../Toast";
import Modal from "../ui/Modal";
import RichTextEditor from "../ui/RichTextEditor";
import ImageCropper from "../ui/ImageCropper";

interface HeroCarousel {
  id: number;
  image_url: string;
  title: string;
  subtitle: string;
  link: string;
  order: number;
  is_active: boolean;
  view_type: "desktop" | "mobile";
}

interface UnifiedSettingsProps {
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

const UnifiedSettings: React.FC<UnifiedSettingsProps> = ({
  onSuccess,
  onError,
}) => {
  const { token } = useAuth();
  // Delivery settings
  const [deliveryFeeNcr, setDeliveryFeeNcr] = useState<number>(80);
  const [deliveryFeeOutsideNcr, setDeliveryFeeOutsideNcr] =
    useState<number>(120);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(0);
  // Product hold duration
  const [productHoldDuration, setProductHoldDuration] = useState<number>(30);
  // Carousel settings
  const [intervalInput, setIntervalInput] = useState<number>(5000);
  const [carousels, setCarousels] = useState<HeroCarousel[]>([]);
  // Carousel modal
  const [showCarouselModal, setShowCarouselModal] = useState(false);
  const [editing, setEditing] = useState<HeroCarousel | null>(null);
  const [carouselForm, setCarouselForm] = useState<
    Partial<HeroCarousel> & { image?: File | null }
  >({
    image: null,
    title: "",
    subtitle: "",
    link: "",
    order: 0,
    is_active: true,
    view_type: "desktop",
  });
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({ message: "", type: "success", visible: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paymentOptionsDescription, setPaymentOptionsDescription] =
    useState<string>("");
  const [whatHappensAfterPayment, setWhatHappensAfterPayment] =
    useState<string>("");

  // Image cropper states
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>("");
  const [croppedImagePreview, setCroppedImagePreview] = useState<string>("");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    if (type === "success" && onSuccess) onSuccess(message);
    if (type === "error" && onError) onError(message);
  };

  // Fetch all settings and carousels
  const fetchAll = async () => {
    setLoading(true);
    try {
      if (!token) return;
      // Delivery settings
      const settings = await SettingService.getAllSettings(token);
      const ncrSetting = settings.find((s) => s.key === "delivery_fee_ncr");
      const outsideNcrSetting = settings.find(
        (s) => s.key === "delivery_fee_outside_ncr"
      );
      const thresholdSetting = settings.find(
        (s) => s.key === "free_delivery_threshold"
      );
      const paymentOptionsSetting = settings.find(
        (s) => s.key === "payment_options_description"
      );
      const whatHappensSetting = settings.find(
        (s) => s.key === "what_happens_after_payment"
      );
      const holdDurationSetting = settings.find(
        (s) => s.key === "product_hold_duration"
      );
      if (ncrSetting) setDeliveryFeeNcr(parseInt(ncrSetting.value));
      if (outsideNcrSetting)
        setDeliveryFeeOutsideNcr(parseInt(outsideNcrSetting.value));
      if (thresholdSetting)
        setFreeDeliveryThreshold(parseInt(thresholdSetting.value));
      if (paymentOptionsSetting)
        setPaymentOptionsDescription(paymentOptionsSetting.value || "");
      if (whatHappensSetting)
        setWhatHappensAfterPayment(whatHappensSetting.value || "");
      if (holdDurationSetting)
        setProductHoldDuration(parseInt(holdDurationSetting.value));
      // Carousel
      const carouselRes = await HeroCarouselApi.getAll(token);
      setCarousels(carouselRes.data.carousels);
      setIntervalInput(carouselRes.data.interval);
    } catch (err) {
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [token]);

  // Unified save handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      // Save delivery, interval, and payment options description settings
      await SettingService.updateMultipleSettings(token, [
        { key: "delivery_fee_ncr", value: deliveryFeeNcr },
        { key: "delivery_fee_outside_ncr", value: deliveryFeeOutsideNcr },
        { key: "free_delivery_threshold", value: freeDeliveryThreshold },
        { key: "hero_carousel_interval", value: intervalInput },
        {
          key: "payment_options_description",
          value: paymentOptionsDescription,
        },
        { key: "what_happens_after_payment", value: whatHappensAfterPayment },
        { key: "product_hold_duration", value: productHoldDuration },
      ]);
      showToast("Settings updated successfully.", "success");
    } catch (err: any) {
      showToast("Failed to update settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Carousel CRUD
  const handleEditCarousel = (carousel: HeroCarousel) => {
    setEditing(carousel);
    setCarouselForm({ ...carousel, image: null });
    setCroppedImagePreview("");
    setShowCarouselModal(true);
  };
  const handleDeleteCarousel = async (id: number) => {
    if (!token) return;
    if (!window.confirm("Delete this slide?")) return;
    try {
      await HeroCarouselApi.delete(token, id);
      showToast("Slide deleted successfully.", "success");
      fetchAll();
    } catch {
      showToast("Failed to delete slide.", "error");
    }
  };
  const handleCarouselFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked;
    }
    setCarouselForm((prev) => ({ ...prev, [name]: fieldValue }));
  };
  const handleCarouselImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setTempImageSrc(imageUrl);
      setShowImageCropper(true);
    }
  };

  const handleImageCropComplete = (croppedImageBlob: Blob) => {
    // Convert blob to file
    const file = new File([croppedImageBlob], "hero-carousel-image.jpg", {
      type: "image/jpeg",
    });
    setCarouselForm((prev) => ({ ...prev, image: file }));
    setCroppedImagePreview(URL.createObjectURL(file));
    setShowImageCropper(false);
    setTempImageSrc("");
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setTempImageSrc("");
  };
  const handleCarouselSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setValidationErrors({});
    const formData = new FormData();
    if (carouselForm.image) formData.append("image", carouselForm.image);
    formData.append("title", carouselForm.title || "");
    formData.append("subtitle", carouselForm.subtitle || "");
    formData.append("link", carouselForm.link || "");
    formData.append("order", String(carouselForm.order || 0));
    formData.append("is_active", carouselForm.is_active ? "1" : "0");
    formData.append("view_type", carouselForm.view_type || "desktop");
    try {
      if (editing) {
        await HeroCarouselApi.update(token, editing.id, formData);
        showToast("Slide updated successfully.", "success");
      } else {
        await HeroCarouselApi.create(token, formData);
        showToast("Slide created successfully.", "success");
      }
      setShowCarouselModal(false);
      setEditing(null);
      setCarouselForm({
        image: null,
        title: "",
        subtitle: "",
        link: "",
        order: 0,
        is_active: true,
        view_type: "desktop",
      });
      setCroppedImagePreview("");
      fetchAll();
    } catch (err: any) {
      console.log(err);
      if (err && err.message && err.message.includes("422")) {
        if (err.response && err.response.errors) {
          setValidationErrors(err.response.errors);
        } else if (err.errors) {
          setValidationErrors(err.errors);
        } else {
          showToast("Validation error. Please check your input.", "error");
        }
      } else if (err && err.errors) {
        setValidationErrors(err.errors);
        showToast("Validation error. Please check your input.", "error");
      } else {
        showToast(err.message || "Failed to save.", "error");
      }
    }
  };

  if (loading) return <div className="p-4">Loading settings...</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
      <h2 className="text-xl font-medium mb-6">Shop Settings</h2>
      <form onSubmit={handleSaveSettings}>
        {/* Product Hold Duration */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Hold Duration (minutes)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={productHoldDuration}
            onChange={(e) =>
              setProductHoldDuration(parseInt(e.target.value) || 30)
            }
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            How long a product will be held for a customer during checkout
            before being released back to available status.
          </p>
        </div>
        {/* Delivery Fee Settings */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Standard Delivery Fee Within NCR (₱)
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={deliveryFeeNcr}
            onChange={(e) => setDeliveryFeeNcr(parseInt(e.target.value) || 0)}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            The standard delivery fee for addresses within NCR.
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Standard Delivery Fee Outside NCR (₱)
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={deliveryFeeOutsideNcr}
            onChange={(e) =>
              setDeliveryFeeOutsideNcr(parseInt(e.target.value) || 0)
            }
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            The standard delivery fee for addresses outside NCR.
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Free Delivery Threshold (₱)
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={freeDeliveryThreshold}
            onChange={(e) =>
              setFreeDeliveryThreshold(parseInt(e.target.value) || 0)
            }
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
          />
          <p className="text-sm text-gray-500 mt-1">
            Orders above this amount will qualify for free delivery. Set to 0 to
            disable free delivery.
          </p>
        </div>
        {/* Payment Options Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Options Description
          </label>
          <RichTextEditor
            value={paymentOptionsDescription}
            onChange={setPaymentOptionsDescription}
          />
          <p className="text-sm text-gray-500 mt-1">
            This description will be shown to customers at checkout. You can use
            formatting, links, and images.
          </p>
        </div>
        {/* What Happens After Payment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Checkout Prompt
          </label>
          <RichTextEditor
            value={whatHappensAfterPayment}
            onChange={setWhatHappensAfterPayment}
          />
          <p className="text-sm text-gray-500 mt-1">
            This description will be shown to customers after they place an
            order. You can use formatting, links, and images.
          </p>
        </div>
        {/* Carousel Interval */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hero Carousel Image Change Interval (ms)
          </label>
          <input
            type="number"
            min={1000}
            step={100}
            value={intervalInput}
            onChange={(e) => setIntervalInput(parseInt(e.target.value, 10))}
            className="w-40 border-gray-300 rounded-md shadow-sm p-2 border"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
      {/* Carousel Slides CRUD */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">Hero Carousel Slides</h3>
            <p className="text-sm text-gray-600 mt-1">
              Create separate slides for desktop and mobile views. Desktop
              slides show on screens ≥768px wide.
            </p>
          </div>
          <button
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            onClick={() => {
              setShowCarouselModal(true);
              setEditing(null);
              setCarouselForm({
                image: null,
                title: "",
                subtitle: "",
                link: "",
                order: 0,
                is_active: true,
                view_type: "desktop",
              });
              setCroppedImagePreview("");
            }}
          >
            Add Slide
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 mb-6">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Subtitle</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">View Type</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {carousels
                .sort((a, b) => {
                  // First sort by view_type (desktop first, then mobile)
                  if (a.view_type !== b.view_type) {
                    return a.view_type === "desktop" ? -1 : 1;
                  }
                  // Then sort by order
                  return a.order - b.order;
                })
                .map((slide) => (
                  <tr key={slide.id} className="border-b">
                    <td className="px-4 py-2">
                      {slide.image_url && (
                        <img
                          src={slide.image_url}
                          alt=""
                          className="h-16 w-32 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="px-4 py-2">{slide.title}</td>
                    <td className="px-4 py-2">{slide.subtitle}</td>
                    <td className="px-4 py-2 max-w-xs truncate">
                      {slide.link}
                    </td>
                    <td className="px-4 py-2">{slide.order}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          slide.view_type === "desktop"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {slide.view_type === "desktop" ? "Desktop" : "Mobile"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {slide.is_active ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleEditCarousel(slide)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDeleteCarousel(slide.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Carousel Modal */}
      <Modal
        isOpen={showCarouselModal}
        onClose={() => {
          setShowCarouselModal(false);
          setEditing(null);
          setValidationErrors({});
          setCroppedImagePreview("");
        }}
        title={editing ? "Edit Slide" : "Add Slide"}
      >
        <form onSubmit={handleCarouselSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              View Type
            </label>
            <select
              name="view_type"
              value={carouselForm.view_type || "desktop"}
              onChange={(e) => {
                const newViewType = e.target.value as "desktop" | "mobile";
                // Check if user has an uploaded image and view type is changing
                if (
                  (croppedImagePreview || carouselForm.image) &&
                  carouselForm.view_type !== newViewType
                ) {
                  const confirmChange = window.confirm(
                    "Changing the view type will remove the current image. You will need to upload and crop a new image with the appropriate aspect ratio. Continue?"
                  );
                  if (!confirmChange) {
                    return; // Don't change if user cancels
                  }
                  // Reset image states
                  setCroppedImagePreview("");
                  setCarouselForm((prev) => ({
                    ...prev,
                    image: null,
                    view_type: newViewType,
                  }));
                } else {
                  setCarouselForm((prev) => ({
                    ...prev,
                    view_type: newViewType,
                  }));
                }
              }}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            >
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Desktop images will be shown on screens 768px and wider. Mobile
              images will be shown on smaller screens.
            </p>
            {validationErrors.view_type && (
              <div className="text-red-600 text-xs mt-1">
                {validationErrors.view_type.join(", ")}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={carouselForm.title || ""}
              onChange={handleCarouselFormChange}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            />
            {validationErrors.title && (
              <div className="text-red-600 text-xs mt-1">
                {validationErrors.title.join(", ")}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={carouselForm.subtitle || ""}
              onChange={handleCarouselFormChange}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            />
            {validationErrors.subtitle && (
              <div className="text-red-600 text-xs mt-1">
                {validationErrors.subtitle.join(", ")}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              name="link"
              value={carouselForm.link || ""}
              onChange={handleCarouselFormChange}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            />
            {validationErrors.link && (
              <div className="text-red-600 text-xs mt-1">
                {validationErrors.link.join(", ")}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Order
            </label>
            <input
              type="number"
              name="order"
              value={carouselForm.order || 0}
              onChange={handleCarouselFormChange}
              className="w-full border-gray-300 rounded-md shadow-sm p-2 border"
            />
            {validationErrors.order && (
              <div className="text-red-600 text-xs mt-1">
                {validationErrors.order.join(", ")}
              </div>
            )}
          </div>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={!!carouselForm.is_active}
                onChange={handleCarouselFormChange}
                className="mr-2"
              />
              Active
            </label>
            {validationErrors.is_active && (
              <div className="text-red-600 text-xs mt-1">
                {validationErrors.is_active.join(", ")}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image
            </label>
            <div className="mt-2">
              {croppedImagePreview ? (
                <div className="mb-4">
                  <img
                    src={croppedImagePreview}
                    alt="Cropped preview"
                    className="h-32 w-48 object-cover rounded border"
                  />
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Image cropped and ready
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCarouselForm((prev) => ({ ...prev, image: null }));
                      setCroppedImagePreview("");
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCarouselImageChange}
                    ref={fileInputRef}
                  />
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Recommended Image Dimensions:
                    </p>
                    {carouselForm.view_type === "desktop" ? (
                      <p className="text-xs text-blue-700">
                        <strong>Desktop:</strong> 1920x1080px (16:9 ratio) - for
                        wide screens ≥768px
                      </p>
                    ) : (
                      <p className="text-xs text-blue-700">
                        <strong>Mobile:</strong> 1080x1440px (3:4 ratio) - for
                        screens &lt;768px
                      </p>
                    )}
                    <p className="text-xs text-blue-600 mt-1">
                      📐 Images will be automatically cropped to the optimal
                      aspect ratio for better display
                    </p>
                  </div>
                </>
              )}
              {!croppedImagePreview &&
                !carouselForm.image &&
                carouselForm.image_url && (
                  <div className="mt-2">
                    <img
                      src={carouselForm.image_url}
                      alt="Current"
                      className="h-32 w-48 object-cover rounded border"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current image</p>
                  </div>
                )}
            </div>
            {validationErrors.image && (
              <div className="text-red-600 text-xs mt-1">
                {validationErrors.image.join(", ")}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              {editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
              onClick={() => {
                setShowCarouselModal(false);
                setEditing(null);
                setValidationErrors({});
                setCroppedImagePreview("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Image Cropper */}
      {showImageCropper && (
        <ImageCropper
          src={tempImageSrc}
          onCropComplete={handleImageCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={carouselForm.view_type === "desktop" ? 16 / 9 : 3 / 4}
        />
      )}
    </div>
  );
};

export default UnifiedSettings;
