"""test_platform_settings.py — Test script for all 5 Global Platform Configuration & Maintenance settings."""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from db import platform_settings_repo, listings_repo
from rest_framework.test import APIClient
from apps.accounts.authentication import _MongoUser

def run_tests():
    print("=" * 60)
    print("STARTING PLATFORM SETTINGS VERIFICATION TESTS")
    print("=" * 60)

    client = APIClient()

    # 1. Test Fetch & Update Settings
    print("\n--- 1. Testing GET & PUT /api/admin/settings ---")
    settings = platform_settings_repo.get_platform_settings()
    print(f"Initial Settings: {settings}")
    assert "maintenance_mode" in settings
    assert "auto_approve_listings" in settings
    assert "max_upload_size_mb" in settings
    assert "gemini_enabled" in settings
    assert "gemini_daily_quota" in settings
    print("[OK] Default platform settings structure verified.")

    # Update settings
    new_cfg = {
        "maintenance_mode": False,
        "auto_approve_listings": True,
        "max_upload_size_mb": 5,
        "gemini_enabled": True,
        "gemini_daily_quota": 5000
    }
    updated = platform_settings_repo.update_platform_settings(new_cfg)
    assert updated["auto_approve_listings"] is True
    assert updated["max_upload_size_mb"] == 5
    assert updated["gemini_daily_quota"] == 5000
    print("[OK] Platform settings repository update verified.")

    # 2. Test Auto-Approve Property Listings (Option 2)
    print("\n--- 2. Testing Option 2: Auto-Approve Property Listings ---")
    # Enable auto_approve
    platform_settings_repo.update_platform_settings({"auto_approve_listings": True})
    owner_user = _MongoUser({"_id": "test_owner_id", "email": "owner@test.com", "role": "property_owner"})
    client.force_authenticate(user=owner_user)

    res = client.post('/api/listings', {
        "title": "Auto Approved Flat",
        "locality": "Satellite",
        "deal_type": "rent",
        "price": 25000,
        "bhk": 2,
        "bathrooms": 2
    }, format='json')
    print(f"Auto-approve ON create response status: {res.status_code}")
    assert res.status_code == 201
    assert res.data["data"]["status"] == "approved"
    print("[OK] Auto-Approve ENABLED: Listing status set to 'approved' automatically!")

    # Disable auto_approve
    platform_settings_repo.update_platform_settings({"auto_approve_listings": False})
    res2 = client.post('/api/listings', {
        "title": "Pending Review Flat",
        "locality": "Vastrapur",
        "deal_type": "rent",
        "price": 20000,
        "bhk": 2,
        "bathrooms": 2
    }, format='json')
    assert res2.status_code == 201
    assert res2.data["data"]["status"] == "pending_review"
    print("[OK] Auto-Approve DISABLED: Listing status set to 'pending_review'!")

    # 3. Test Max File Upload Limit (Option 3)
    print("\n--- 3. Testing Option 3: Max File Upload Limit ---")
    platform_settings_repo.update_platform_settings({"max_upload_size_mb": 2})
    from django.core.files.uploadedfile import SimpleUploadedFile
    # Create dummy 3MB file
    big_file = SimpleUploadedFile("big_photo.jpg", b"0" * (3 * 1024 * 1024), content_type="image/jpeg")

    res_upload = client.post('/api/listings/upload-image', {'images': [big_file]}, format='multipart')
    print(f"Upload 3MB file when limit is 2MB status: {res_upload.status_code}, msg: {res_upload.data.get('message')}")
    assert res_upload.status_code == 400
    assert "exceeds maximum allowed upload size of 2 MB" in res_upload.data.get("message")
    print("[OK] Max upload size limit (2 MB) enforced successfully on backend!")

    # Reset upload limit back to 10 MB
    platform_settings_repo.update_platform_settings({"max_upload_size_mb": 10})

    # 4. Test Enable/Disable Gemini AI (Option 4)
    print("\n--- 4. Testing Option 4: Enable/Disable Gemini AI Services ---")
    platform_settings_repo.update_platform_settings({"gemini_enabled": False})
    res_ai = client.post('/api/assistant/chat', {"message": "Hello AI"}, format='json')
    print(f"AI chat when gemini_enabled=False status: {res_ai.status_code}, reply: {res_ai.data.get('data', {}).get('reply')}")
    assert res_ai.status_code == 403
    assert "disabled" in res_ai.data.get("data", {}).get("reply")
    print("[OK] Gemini AI disabled setting enforced successfully!")

    # Enable Gemini AI back
    platform_settings_repo.update_platform_settings({"gemini_enabled": True})

    # 5. Test Gemini AI Daily Quota (Option 5)
    print("\n--- 5. Testing Option 5: Gemini AI Daily Quota Request Limit ---")
    platform_settings_repo.update_platform_settings({"gemini_enabled": True, "gemini_daily_quota": 2})
    # Reset count
    db = platform_settings_repo.get_db()
    today_str = platform_settings_repo.datetime.now(platform_settings_repo.timezone.utc).strftime("%Y-%m-%d")
    db["platform_settings"].update_one({"setting_key": "global_config"}, {"$set": {"daily_ai_requests_count": 2, "quota_reset_date": today_str}})

    res_quota = client.post('/api/assistant/chat', {"message": "Quota check"}, format='json')
    print(f"AI chat when quota (2/day) exceeded status: {res_quota.status_code}, reply: {res_quota.data.get('data', {}).get('reply')}")
    assert res_quota.status_code == 429
    assert "quota limit" in res_quota.data.get("data", {}).get("reply")
    print("[OK] Gemini AI daily quota limit enforced successfully!")

    # Reset quota limit back to 10000
    platform_settings_repo.update_platform_settings({"gemini_enabled": True, "gemini_daily_quota": 10000})

    # 6. Test Platform Maintenance Mode (Option 1)
    print("\n--- 6. Testing Option 1: Enable Platform Maintenance Mode ---")
    platform_settings_repo.update_platform_settings({"maintenance_mode": True})

    # Non-admin user request
    res_maint_user = client.get('/api/listings')
    print(f"Non-admin request during maintenance mode status: {res_maint_user.status_code}")
    assert res_maint_user.status_code == 503
    print("[OK] Maintenance Mode ENABLED: Non-admin request blocked with HTTP 503 Maintenance Notice!")

    # Admin user request
    admin_user = _MongoUser({"_id": "test_admin_id", "email": "admin@movesmart.com", "role": "super_admin"})
    client.force_authenticate(user=admin_user)
    res_maint_admin = client.get('/api/admin/settings')
    print(f"Super Admin request during maintenance mode status: {res_maint_admin.status_code}")
    assert res_maint_admin.status_code == 200
    print("[OK] Super Admin unimpeded access during maintenance mode verified!")
    # Reset Maintenance Mode back to False
    platform_settings_repo.update_platform_settings({"maintenance_mode": False})
    print("\n" + "=" * 60)
    print("ALL 5 GLOBAL PLATFORM SETTINGS VERIFIED SUCCESSFULLY! 100% PASSED.")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
