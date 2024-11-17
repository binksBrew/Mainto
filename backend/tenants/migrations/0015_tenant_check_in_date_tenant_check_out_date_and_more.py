# Generated by Django 5.0.4 on 2024-11-13 04:19

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenants', '0014_tenant_deposit_tenant_rent_amount'),
    ]

    operations = [
        migrations.AddField(
            model_name='tenant',
            name='check_in_date',
            field=models.DateField(default=datetime.date.today),
        ),
        migrations.AddField(
            model_name='tenant',
            name='check_out_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='tenant',
            name='last_payment_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='tenant',
            name='rent_paid',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
    ]
