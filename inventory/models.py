from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self): return self.name

class Item(models.Model):
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    
    # --- NEW FIELDS (Point 1 & 2) ---
    vendor_name = models.CharField(max_length=100, blank=True, null=True) 
    invoice_no = models.CharField(max_length=50, blank=True, null=True)
    purchase_date = models.DateField(blank=True, null=True)
    warranty_expiry = models.DateField(blank=True, null=True) # Expiry Alert ke liye
    
    total_quantity = models.IntegerField(default=0)
    available_quantity = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class StockTransaction(models.Model):
    TRANSACTION_TYPES = (('Purchase', 'Purchase (In)'), ('Issue', 'Issue (Out)'), ('Return', 'Return (In)'), ('Damage', 'Damage (Write-off)'))
    CONDITION_CHOICES = (('Good', 'Good'), ('Damaged', 'Damaged')) # Point 3

    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    
    # --- NEW FIELDS (Point 3 & 5) ---
    issued_to = models.CharField(max_length=100, blank=True, null=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='Good') 
    note = models.TextField(blank=True, null=True) # History Log Reason
    date = models.DateTimeField(auto_now_add=True) # Exact Time for History
    
    def save(self, *args, **kwargs):
        if self.pk is None: # Only on create
            if self.type == 'Purchase' or self.type == 'Return':
                self.item.available_quantity += self.quantity
                if self.type == 'Purchase': self.item.total_quantity += self.quantity
            
            elif self.type == 'Issue':
                if self.item.available_quantity >= self.quantity:
                    self.item.available_quantity -= self.quantity
                else:
                    raise ValueError("Not enough stock!")
            
            elif self.type == 'Damage': # Write-off stock
                self.item.available_quantity -= self.quantity
                self.item.total_quantity -= self.quantity

            self.item.save()
        super().save(*args, **kwargs)