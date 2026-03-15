from django.core.serializers import serialize
from .models import RecycleBinItem

def soft_delete(instance, user_name="Super Admin"):
    
    
    data = serialize('json', [instance])

    RecycleBinItem.objects.create(
        original_model_name=instance._meta.model_name.capitalize(),
        original_object_id=str(instance.pk),
        object_repr=str(instance),
        object_data=data,
        deleted_by=user_name
    )

    instance.delete()