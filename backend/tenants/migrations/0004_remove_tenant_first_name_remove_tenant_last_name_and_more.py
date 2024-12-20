# Generated by Django 5.0.4 on 2024-09-29 08:19

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenants', '0003_alter_tenant_options_alter_user_managers_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tenant',
            name='first_name',
        ),
        migrations.RemoveField(
            model_name='tenant',
            name='last_name',
        ),
        migrations.AlterField(
            model_name='tenant',
            name='rental_status',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='tenant',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='tenant_profile', to=settings.AUTH_USER_MODEL),
        ),
    ]
