# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0007_calificacion_reportada'),
    ]

    operations = [
        migrations.AddField(
            model_name='calificacion',
            name='motivo_reporte',
            field=models.TextField(blank=True, null=True),
        ),
    ]

