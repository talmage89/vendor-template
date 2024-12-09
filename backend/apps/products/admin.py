from django.contrib import admin
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.admin import GenericTabularInline

from .models import ProductColor, ProductImage, ProductSize, ShirtType, Shirt


class ProductColorInline(GenericTabularInline):
    model = ProductColor
    extra = 1
    fields = ["name", "order"]


class ProductImageInline(GenericTabularInline):
    model = ProductImage
    extra = 1
    fields = ["color", "image", "is_default"]

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "color":
            if hasattr(request, "_obj_") and request._obj_:
                kwargs["queryset"] = ProductColor.objects.filter(
                    content_type=ContentType.objects.get_for_model(request._obj_),
                    object_id=request._obj_.id,
                )
            else:
                kwargs["queryset"] = ProductColor.objects.none()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


class ProductSizeAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "order", "is_active"]
    ordering = ["order"]


class ClothingAdmin(admin.ModelAdmin):
    inlines = [ProductColorInline, ProductImageInline]
    filter_horizontal = ["available_sizes"]
    list_display = ["name", "product_type", "get_sizes", "get_colors"]
    search_fields = ["name"]
    readonly_fields = ["get_base_price_display"]

    def get_fieldsets(self, request, obj=None):
        priority_fieldset = (
            "Product Details",
            {
                "fields": (
                    "name",
                    "product_type",
                    "get_base_price_display",
                    "price_adjustment_cents",
                )
            },
        )

        fields = self.get_fields(request, obj)
        priority_fields = priority_fieldset[1]["fields"]
        remaining_fields = [f for f in fields if f not in priority_fields]

        options_fieldset = (
            "Options",
            {
                "fields": remaining_fields,
            },
        )

        return [priority_fieldset, options_fieldset]

    def get_base_price_display(self, obj):
        if obj and obj.product_type:
            return f"${obj.product_type.base_price_cents / 100:.2f}"
        return "N/A"

    def get_sizes(self, obj):
        return ", ".join([size.code for size in obj.available_sizes.all()])

    def get_colors(self, obj):
        return ", ".join([color.name for color in obj.colors.all()])

    def get_form(self, request, obj=None, **kwargs):
        request._obj_ = obj
        return super().get_form(request, obj, **kwargs)

    get_base_price_display.short_description = "Base Price"
    get_sizes.short_description = "Sizes"
    get_colors.short_description = "Colors"


class ShirtAdmin(ClothingAdmin):
    pass


class ArtworkAdmin(admin.ModelAdmin):
    inlines = [ProductImageInline]


admin.site.register(ShirtType)
admin.site.register(Shirt, ShirtAdmin)
admin.site.register(ProductImage)
admin.site.register(ProductColor)
admin.site.register(ProductSize, ProductSizeAdmin)
