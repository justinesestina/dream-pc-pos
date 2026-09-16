# Latest Updates (Quotations & Products)

Here is a simple summary of all the new features and improvements we added today:

## Products Module

### 1. WordPress Media Library Image Upload Integration
- **What it does:** The Product Form image uploader is now fully connected to the WordPress Media Library! When you upload a local image, the frontend seamlessly sends it to the backend `POST /api/v1/media` endpoint, which securely forwards it to your WooCommerce/WordPress site using your logged-in WP App Password.
- **Why it is useful:** Instead of just saving a heavy base64 string locally in the browser, the images are actually uploaded to your live WordPress media server, which returns a permanent, lightweight URL (e.g. `https://dreampcbuild.com/wp-content/uploads/...`). If the backend isn't running or the internet goes down, it will gracefully fall back to storing the image locally so your staff can keep working.

### 2. Enhanced Image Display Styling
- **What it does:** We added enhanced image containers with `object-contain` framing and crisp white background padding to ensure that the full product image is completely visible without cropping in the Product Form, Products Table, and POS Cashier Screen.
- **Why it is useful:** Prevents cropping of product images, keeping the product catalog visual and easier to navigate.

## Quotations Module

### 1. Percentage Discount Toggle
- **What it does:** You can now choose between a flat cash discount (`₱`) or a percentage discount (`%`) in the Quote Editor.
- **Why it is useful:** Staff do not need to use a calculator anymore. If they want to give a 5% discount, the system will automatically calculate the exact amount in pesos.

### 2. Estimated Margin (Profit) Indicator
- **What it does:** Inside the Quote Editor, the system now calculates your profit by subtracting the exact cost of the items from the selling price. It shows the profit margin as a percentage (%) and an amount (₱).
- **Why it is useful:** It acts as a safety warning. If a staff member gives a discount that is too big, the indicator will turn **RED** (if profit drops below 5%). This stops your staff from accidentally selling a computer at a loss.

### 3. Duplicate Quote Button
- **What it does:** We added a "Duplicate" button when you view a Quotation. Clicking it will instantly create a brand new copy of that exact quotation.
- **Why it is useful:** Sometimes customers ask for multiple options (Example: "Option A is ₱50,000. What if we use a cheaper graphics card?"). Instead of creating a new quotation from scratch, the staff can just duplicate Option A, change the graphics card, and save it as Option B. This saves a lot of typing and time!

---

## Point of Sale (POS) Cashier Register

### 1. Navigation Shortcut
- **What it does:** Added the **Point of Sale** item directly under the `Sales` menu in the sidebar navigation with a dedicated Shopping Cart icon.
- **Why it is useful:** Cashiers and store staff can access the POS register screen in just 1 click from anywhere in the application.

### 2. Product Thumbnails in Cashier Screen
- **What it does:** Updated both the **Grid View** and **List View** of the POS product browser to display product thumbnail images, stock status badges, and quick-add indicators. Small image thumbnails were also added to each item line in the Cart panel.
- **Why it is useful:** Gives cashiers a modern visual interface (similar to Square/Shopify POS) so they can visually identify items, avoid ring-up mistakes, and quickly add items to the customer's cart.
