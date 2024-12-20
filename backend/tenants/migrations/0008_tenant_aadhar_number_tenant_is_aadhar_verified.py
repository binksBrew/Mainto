# Generated by Django 5.0.4 on 2024-10-24 17:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenants', '0007_remove_tenant_contact_info_tenant_tenant_email_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='tenant',
            name='aadhar_number',
            field=models.CharField(blank=True, max_length=12),
        ),
        migrations.AddField(
            model_name='tenant',
            name='is_aadhar_verified',
            field=models.BooleanField(default=False),
        ),
    ]
