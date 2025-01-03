# Generated by Django 5.1.4 on 2024-12-11 21:58

import django_countries.fields
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0014_alter_productshippingcost_country"),
    ]

    operations = [
        migrations.AlterField(
            model_name="productshippingcost",
            name="country",
            field=django_countries.fields.CountryField(
                blank=True,
                help_text="Leave empty for 'Rest of World' rate",
                max_length=2,
                null=True,
            ),
        ),
    ]
