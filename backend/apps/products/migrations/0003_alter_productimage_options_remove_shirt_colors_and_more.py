# Generated by Django 5.1.4 on 2024-12-09 22:38

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0002_remove_artwork_sku_remove_shirt_sku"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="productimage",
            options={"ordering": ["-is_default", "-created_at"]},
        ),
        migrations.RemoveField(
            model_name="shirt",
            name="colors",
        ),
        migrations.RemoveField(
            model_name="shirt",
            name="inventory_count",
        ),
        migrations.RemoveField(
            model_name="shirt",
            name="sizes",
        ),
        migrations.RemoveField(
            model_name="shirt",
            name="unlimited_inventory",
        ),
        migrations.AddField(
            model_name="productimage",
            name="color",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name="productimage",
            name="is_default",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="shirt",
            name="available_options",
            field=models.JSONField(
                default=dict,
                help_text="Available options for this product. Format: {'sizes': ['S', 'M', 'L'], 'colors': ['Red', 'Blue']}",
            ),
        ),
        migrations.AddField(
            model_name="shirt",
            name="default_variant_name",
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]