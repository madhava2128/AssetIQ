# AssetIQ — QR Phone Testing Checklist (For Website Owner)

This simple, step-by-step checklist is for hospital administrators, biomedical engineers, or equipment managers to verify QR-based equipment tracking using a **physical smartphone** after AssetIQ is deployed to production on Vercel.

**Production Web Address:** [https://assetiq-omega.vercel.app](https://assetiq-omega.vercel.app)

---

## Preparation Before Testing

1. **Verify Deployment & Environment Variable:**
   - In your Vercel Project Dashboard, confirm that `NEXT_PUBLIC_APP_URL` is set to `https://assetiq-omega.vercel.app` in the **Production** environment variables.
   - Ensure a fresh deployment completed after setting this variable (Next.js bakes `NEXT_PUBLIC_` values into the app during compilation).
2. **Devices Needed:**
   - A desktop or laptop computer showing AssetIQ in a web browser.
   - An iPhone or Android smartphone with a working camera app connected to the internet.
   - A standard office printer loaded with white paper or label sticker paper.

---

## 5-Step Physical Phone Test

### Step 1: Scan First Equipment Label from Screen or Paper
1. On your computer, sign in as Biomedical Engineer (`biomed@assetiq.in` / `BiomedPass2026!`).
2. Go to **Equipment** (`/assets`) and click on any piece of equipment (for example, *Mindray A7 Anesthesia System*).
3. Look at the **QR Equipment Label** card on the right (or at the top if newly registered).
4. Point your phone camera at the QR code on the computer screen (no special app needed—just open your phone's built-in camera).
5. Tap the link banner that pops up on your phone screen.
6. **Expected result:**
   - Your phone browser opens `https://assetiq-omega.vercel.app/login?next=/assets/...`.
   - After signing in, you immediately land directly on the scanned equipment's details page.
   - The equipment name, tag (e.g. `AST-ANES-001`), location, and health status match what is on the computer.

---

### Step 2: Scan Second Equipment Label (Different Asset & Sign-Out Test)
1. On your computer, open a second piece of equipment with a different tag (for example, *Olympus Laparoscopy Tower*).
2. On your phone, tap **Sign out** from the top right user menu.
3. Open your phone camera and scan the QR code for this second piece of equipment.
4. **Expected result:**
   - The phone browser opens the AssetIQ sign-in page, noting that sign-in is required to view equipment details.
   - Enter your login details and submit.
   - You land directly on the second asset's details page (not the first asset, and not the general dashboard).
   - Now scan the QR code while already signed in: it opens the asset page instantly with no extra login step.

---

### Step 3: Equipment Edit Immutability Test
1. On your computer, open the first asset and click **Edit** (or edit from the equipment list).
2. Change the equipment name (e.g. append `(Wing B)`), change its room, or update its serial number.
3. Save the changes.
4. On your phone, scan the **original QR code** you viewed or printed earlier.
5. **Expected result:**
   - The same equipment page opens immediately.
   - The page displays the **new** updated name and room.
   - The physical QR code remains completely valid—you never need to re-print or replace equipment stickers when updating asset information in the system.

---

### Step 4: Report an Incident from Phone & Check Role Permissions
1. While viewing the equipment on your phone as Biomedical Engineer (`biomed@assetiq.in`), tap the blue **Report an incident** button.
2. Select the problem type (e.g., *Mechanical Failure*), severity (*High: equipment cannot be used*), and describe what happened (e.g., *Gas delivery pressure sensor alarm sounded*).
3. Tap **Submit incident**.
4. **Expected result:**
   - A green confirmation appears: *"Incident reported for Mindray A7 Anesthesia System."*
   - The equipment status updates to **Under Repair**.
   - The new incident immediately appears under **Incident History** on the phone, showing the reporter name, date, and downtime counter.
   - On the computer, refresh the Hospital Admin Overview (`/overview`) and confirm the incident is visible on the hospital dashboard.
5. Now sign in on the phone as an Operating Theatre Administrator (`ot.admin@assetiq.in` / `OtPass2026!`) and scan the same equipment.
6. **Expected result:**
   - The **Report an incident** button is not shown.
   - Instead, a helpful notice states: *"To report a problem with this equipment, contact biomedical engineering."*

---

### Step 5: Actual-Size Paper Print & Distance Scan Test
1. On your computer's equipment details page, click **Print label** (or select multiple items on the equipment catalog and click **Print QR labels**).
2. The print preview opens showing a clean, high-contrast, black-on-white sticker layout (50 mm x 50 mm) containing the AssetIQ header, QR code, equipment name, and asset tag.
3. Print the label on paper.
4. Hold your phone camera about 20 cm (8 inches) away from the printed label under normal room lighting.
5. **Expected result:**
   - The camera instantly detects the QR code and prompts you to open the production link.
   - The sticker fits neatly onto standard hospital equipment panels without obstructing vents, dials, or serial plates.

---

## Test Results Record Sheet

| Check # | Test Item | Result | Tester Initials | Date |
|---|---|---|---|---|
| 1 | Phone camera opens first asset on production domain after login | [ ] Pass &nbsp; [ ] Fail | ____________ | ________ |
| 2 | Second QR opens second asset; return-to-page after login works | [ ] Pass &nbsp; [ ] Fail | ____________ | ________ |
| 3 | Edited asset name/location displays without reprinting QR code | [ ] Pass &nbsp; [ ] Fail | ____________ | ________ |
| 4 | Incident reported from phone updates status to Under Repair | [ ] Pass &nbsp; [ ] Fail | ____________ | ________ |
| 5 | OT Admin view shows contact message; report button is hidden | [ ] Pass &nbsp; [ ] Fail | ____________ | ________ |
| 6 | 50 mm x 50 mm printed paper label scans reliably at 20 cm | [ ] Pass &nbsp; [ ] Fail | ____________ | ________ |
