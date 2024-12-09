# Generated by Django 5.1.4 on 2024-12-09 21:51

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="ArtworkType",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField()),
                ("base_price_cents", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "category",
                    models.CharField(
                        choices=[
                            ("figure", "Figure"),
                            ("multi-figure", "Multi-Figure"),
                            ("landscape", "Landscape"),
                            ("still-life", "Still-Life"),
                            ("abstract", "Abstract"),
                            ("other", "Other"),
                        ],
                        max_length=255,
                    ),
                ),
                ("medium", models.CharField(max_length=255)),
            ],
            options={
                "verbose_name": "Artwork Type",
                "verbose_name_plural": "Artwork Types",
            },
        ),
        migrations.CreateModel(
            name="ShirtType",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField()),
                ("base_price_cents", models.IntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "gender",
                    models.CharField(
                        choices=[
                            ("male", "Male"),
                            ("female", "Female"),
                            ("unisex", "Unisex"),
                        ],
                        max_length=255,
                    ),
                ),
            ],
            options={
                "verbose_name": "Shirt Type",
                "verbose_name_plural": "Shirt Types",
            },
        ),
        migrations.CreateModel(
            name="Artwork",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("sku", models.CharField(max_length=100, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("price_adjustment_cents", models.IntegerField(default=0)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("unavailable", "Unavailable"),
                            ("available", "Available"),
                            ("sold", "Sold"),
                            ("not_for_sale", "Not for Sale"),
                        ],
                        max_length=255,
                    ),
                ),
                ("dimensions", models.CharField(max_length=255)),
                ("weight", models.CharField(max_length=255)),
                ("artist", models.CharField(max_length=255)),
                ("year", models.CharField(max_length=255)),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField()),
                (
                    "product_type",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        to="products.artworktype",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
        migrations.CreateModel(
            name="ProductImage",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("image", models.ImageField(upload_to="product_images")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("object_id", models.UUIDField()),
                (
                    "content_type",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="contenttypes.contenttype",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Shirt",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("sku", models.CharField(max_length=100, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("price_adjustment_cents", models.IntegerField(default=0)),
                ("inventory_count", models.IntegerField(default=0)),
                ("unlimited_inventory", models.BooleanField(default=False)),
                ("sizes", models.JSONField(default=list)),
                ("colors", models.JSONField(default=list)),
                (
                    "product_type",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        to="products.shirttype",
                    ),
                ),
            ],
            options={
                "abstract": False,
            },
        ),
    ]
