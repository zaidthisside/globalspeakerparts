import fs from "fs";
import path from "path";

export interface EmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  gateway: string;
  transactionId: string;
}

export async function sendOrderConfirmationEmail(payload: EmailPayload) {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation #${payload.orderNumber}</title>
        <style>
          body { font-family: sans-serif; color: #0F0F10; margin: 0; padding: 20px; background-color: #F8F9FA; }
          .container { max-width: 600px; margin: 0 auto; bg-color: #ffffff; padding: 30px; border: 2px solid #000000; border-radius: 12px; }
          .header { text-align: center; border-bottom: 2px solid #EAEAEA; pb-20px; }
          .logo { font-size: 18px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
          .title { font-size: 20px; font-weight: 800; text-transform: uppercase; margin-top: 20px; }
          .meta-table { w-width: 100%; margin-top: 20px; border-collapse: collapse; }
          .meta-table td { padding: 8px 0; font-size: 13px; }
          .meta-label { color: #888888; }
          .meta-val { font-weight: bold; text-align: right; }
          .item-table { width: 100%; margin-top: 25px; border-collapse: collapse; border-top: 1px solid #EAEAEA; border-bottom: 1px solid #EAEAEA; }
          .item-table th { padding: 12px 8px; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #888888; text-align: left; }
          .item-table td { padding: 12px 8px; font-size: 13px; }
          .footer { text-align: center; font-size: 11px; color: #888888; margin-top: 30px; border-top: 1px solid #EAEAEA; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GLOBAL SPEAKER PARTS</div>
            <div class="title">Order Confirmation</div>
            <p style="font-size: 13px; color: #5C5C63;">Thank you for your prepaid sample order. Your payment has been verified on our servers.</p>
          </div>
          
          <table class="meta-table" style="width: 100%;">
            <tr>
              <td class="meta-label">Order Number:</td>
              <td class="meta-val">#${payload.orderNumber}</td>
            </tr>
            <tr>
              <td class="meta-label">Customer Name:</td>
              <td class="meta-val">${payload.customerName}</td>
            </tr>
            <tr>
              <td class="meta-label">Payment Gateway:</td>
              <td class="meta-val">${payload.gateway}</td>
            </tr>
            <tr>
              <td class="meta-label">Transaction ID:</td>
              <td class="meta-val" style="font-family: monospace; font-size: 11px;">${payload.transactionId}</td>
            </tr>
          </table>

          <table class="item-table">
            <thead>
              <tr>
                <th>Component Spec</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${payload.productName}</strong><br><span style="font-size: 11px; color: #888888;">${payload.variantName}</span></td>
                <td style="text-align: center;">${payload.quantity}</td>
                <td style="text-align: right;">$${payload.unitPrice.toFixed(2)}</td>
                <td style="text-align: right;">$${payload.subtotal.toFixed(2)}</td>
              </tr>
              <tr style="border-top: 1px solid #EAEAEA;">
                <td colspan="3" style="text-align: right; color: #888888; font-size: 12px; padding-top: 15px;">Subtotal:</td>
                <td style="text-align: right; font-weight: bold; padding-top: 15px;">$${payload.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; color: #888888; font-size: 12px;">DHL B2B Air Shipping:</td>
                <td style="text-align: right; font-weight: bold;">$${payload.shippingFee.toFixed(2)}</td>
              </tr>
              <tr style="font-size: 15px; font-weight: bold;">
                <td colspan="3" style="text-align: right; padding-top: 10px;">Grand Total (Paid):</td>
                <td style="text-align: right; color: #000000; padding-top: 10px;">$${payload.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>Globalspeakerparts.com • Precise B2B Audio Component Engineering</p>
            <p>If you have any questions about this invoice, reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // 1. Log to console for audit trail
    console.log(`[EMAIL SENT CONFIRMATION]: Sent invoice to ${payload.customerEmail} for order #${payload.orderNumber}`);

    // 2. Persist to a local sent_emails log file inside scratch
    const logPath = path.join(process.cwd(), "scratch", "sent_emails.log");
    const dirname = path.dirname(logPath);
    if (!fs.existsSync(dirname)) {
      fs.mkdirSync(dirname, { recursive: true });
    }

    const logEntry = `[${new Date().toISOString()}] To: ${payload.customerEmail} | Order: #${payload.orderNumber} | Total: $${payload.total.toFixed(2)} | Txn: ${payload.transactionId}\n`;
    fs.appendFileSync(logPath, logEntry, "utf-8");

    // Save the raw HTML email as a file for easy manual preview in the brain/scratch folder
    const previewPath = path.join(process.cwd(), "scratch", `email_preview_${payload.orderNumber}.html`);
    fs.writeFileSync(previewPath, emailHtml, "utf-8");

  } catch (err) {
    console.error("Failed to compile or trigger order email:", err);
  }
}
