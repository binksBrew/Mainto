# Generated by Django 5.0.4 on 2024-11-13 06:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tenants', '0016_remove_tenant_room_selected'),
    ]

    operations = [
        migrations.AddField(
            model_name='tenant',
            name='room_selected',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]