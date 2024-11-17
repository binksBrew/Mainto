# Generated by Django 5.0.4 on 2024-11-11 14:54

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0002_alter_expense_location'),
    ]

    operations = [
        migrations.AddField(
            model_name='expense',
            name='date_added',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now, help_text='The date and time this expense was added to the system.', verbose_name='Date Added'),
            preserve_default=False,
        ),
    ]
