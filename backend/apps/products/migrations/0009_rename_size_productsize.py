# Generated by Django 5.1.4 on 2024-12-09 23:10

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0008_productcolor_alter_productimage_color"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Size",
            new_name="ProductSize",
        ),
    ]