# Cloudinary Setup Instructions

## Upload Preset Configuration

The blog image upload requires an **unsigned upload preset** in Cloudinary. Follow these steps:

### Step 1: Login to Cloudinary Dashboard
- Go to https://cloudinary.com/console
- Login with your account (Cloud name: `nuho7rn8`)

### Step 2: Create Upload Preset
1. Navigate to **Settings** → **Upload** (or directly: https://cloudinary.com/console/settings/upload)
2. Scroll down to **Upload presets** section
3. Click **Add upload preset**

### Step 3: Configure the Preset
- **Preset name**: `blog_uploads`
- **Signing mode**: Select **Unsigned** (important!)
- **Folder**: `blog` (optional, helps organize images)
- **Format**: Leave as default or set to auto
- **Quality**: `auto:good` (balances quality and file size)
- **Access mode**: `public`

### Step 4: Optional Optimizations (Recommended)
- **Auto tagging**: Enable for better organization
- **Allowed formats**: jpg, png, webp, gif
- **Max file size**: 10 MB
- **Transformations**: Can add default transformations here

### Step 5: Save
Click **Save** to create the preset.

---

## Cloudinary Credentials Used in Code

```javascript
CLOUDINARY_CLOUD_NAME = "nuho7rn8"
CLOUDINARY_API_KEY = "491998869984852"
CLOUDINARY_UPLOAD_PRESET = "blog_uploads"
```

**Note**: The API Secret is NOT needed for unsigned uploads (which is more secure for frontend applications).

---

## Image Optimization Strategy

The component automatically applies these optimizations to reduce credit usage:

1. **Format Auto-Selection** (`f_auto`): Delivers WebP to supported browsers, falls back to original format
2. **Quality Optimization** (`q_auto`): Automatically adjusts quality based on content
3. **Dimension Limiting** (`c_limit,w_1200`): Limits width to 1200px while maintaining aspect ratio
4. **Lazy Loading**: Implemented in frontend components

### Example Optimized URL:
```
https://res.cloudinary.com/nuho7rn8/image/upload/f_auto,q_auto,c_limit,w_1200/blog/my-image.jpg
```

This approach reduces bandwidth by 50-80% compared to unoptimized images!

---

## Testing the Upload

1. Ensure the `blog_uploads` preset is created in Cloudinary
2. The upload component will automatically work once the preset exists
3. Test by uploading an image through the admin blog form

---

## Troubleshooting

### Upload fails with "Invalid upload preset"
- Verify the preset name is exactly `blog_uploads`
- Ensure signing mode is set to **Unsigned**
- Check that the preset is saved

### Images not appearing
- Check browser console for errors
- Verify the Cloudinary URL format is correct
- Ensure images are set to public access mode

### High credit usage
- Verify transformations are applied (check URL has `f_auto,q_auto`)
- Use the `getOptimizedCloudinaryUrl` helper function in frontend components
- Consider reducing max width in transformations if needed
