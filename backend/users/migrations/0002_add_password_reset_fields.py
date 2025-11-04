# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='password_reset_token',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='usuario',
            name='password_reset_token_expires',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

