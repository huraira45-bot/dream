# Implementation Plan - Business Logo Management

Add the ability for businesses to manage their brand logo, which will be used in social media post generation and displayed on their public business page.

## Proposed Changes

### Database & Types
- No changes required, `Business.logoUrl` already exists in `prisma.schema`.

### API Layer
#### [NEW] [route.ts](file:///c:/Users/ServerDeskop/Desktop/dream/src/app/api/businesses/[id]/route.ts)
- Create a `PATCH` endpoint to allow updating business details, specifically `logoUrl`.

### Frontend - Admin Dashboard
#### [MODIFY] [page.tsx](file:///c:/Users/ServerDeskop/Desktop/dream/src/app/admin/(dashboard)/business/[id]/page.tsx)
- Add a "Brand Logo" section in the "Brand Identity" card.
- Include a URL input for the logo and an optional "Extract Branding" button to re-trigger color extraction from the new logo.

#### [NEW] [logo-manager.tsx](file:///c:/Users/ServerDeskop/Desktop/dream/src/components/admin/logo-manager.tsx)
- Create a client component for managing the business logo (input field, save status).

### Frontend - Public Business Page
#### [MODIFY] [page.tsx](file:///c:/Users/ServerDeskop/Desktop/dream/src/app/b/[slug]/page.tsx)
- Replace the placeholder `Music` icon with the business logo if `logoUrl` is present.

## Verification Plan

### Manual Verification
1.  Navigate to the Admin Dashboard for a business.
2.  Enter a valid logo URL in the new "Brand Logo" field.
3.  Save the changes and verify the success notification.
4.  Navigate to the business's public page and verify the logo is displayed.
5.  Trigger a "POST" generation and verify the logo is correctly included in the native branded post.
