# Generated by Django 5.1.4 on 2024-12-11 20:05

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0004_alter_user_email"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="stripe_customer_id",
            field=models.CharField(
                blank=True, max_length=255, null=True, verbose_name="stripe customer id"
            ),
        ),
    ]
