# Generated by Django 5.0.4 on 2024-11-11 14:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='expense',
            name='location',
            field=models.CharField(blank=True, help_text='Room or area where the expense was incurred.', max_length=255, null=True, verbose_name='Custom Location'),
        ),
    ]
