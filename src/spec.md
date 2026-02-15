# Specification

## Summary
**Goal:** Make the Admin Panel entry point highly visible for admins by rendering it as a deep pink button in both desktop and mobile navigation.

**Planned changes:**
- Update the header navigation so that when `isAdmin === true`, the “Admin Panel” item renders as a deep pink button (not a subtle/ghost link) with high-contrast readable text.
- Apply the same deep pink button styling to the mobile menu’s “Admin Panel” entry, including hover/active/focus states and an accessible focus indicator.
- Preserve existing behavior: hide the Admin entry when `isAdmin === false` and do not change any admin access control or routing.

**User-visible outcome:** Admin users will see a clear, deep pink “Admin Panel” button in both desktop and mobile navigation; non-admin users will not see the Admin option.
