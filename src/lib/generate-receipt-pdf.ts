import puppeteer from "puppeteer";

import type { OrderEmailData } from "@/emails/types";
import { formatCentsToBRL } from "@/lib/helpers/money";

type ReceiptLineItem = {
  name: string;
  quantity: number;
  priceInCents: number;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildReceiptHtml = (data: OrderEmailData) => {
  const lineItems: ReceiptLineItem[] = data.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    priceInCents: item.priceInCents,
  }));

  const rows = lineItems
    .map((item) => {
      const lineTotal = item.priceInCents * item.quantity;
      return `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td style="text-align:right">${item.quantity}</td>
          <td style="text-align:right">${formatCentsToBRL(
            item.priceInCents,
          )}</td>
          <td style="text-align:right">${formatCentsToBRL(lineTotal)}</td>
        </tr>
      `;
    })
    .join("");

  const orderDate = new Date(data.createdAt).toLocaleDateString("pt-BR");

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #111827;
          margin: 0;
          padding: 32px;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .company {
          font-size: 20px;
          font-weight: 700;
        }
        .meta {
          font-size: 12px;
          color: #6b7280;
          text-align: right;
        }
        .section {
          margin-bottom: 24px;
        }
        .label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        th {
          text-align: left;
          background: #f9fafb;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6b7280;
        }
        .totals {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;
        }
        .totals table {
          width: 280px;
        }
        .totals td {
          border: none;
          padding: 6px 0;
        }
        .totals tr:last-child td {
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">Sm Grow</div>
        <div class="meta">
          <div>Pedido: #${escapeHtml(data.shortId)}</div>
          <div>Date: ${orderDate}</div>
        </div>
      </div>

      <div class="section">
        <div class="label">Customer</div>
        <div>${escapeHtml(data.customerName)}</div>
        <div>${escapeHtml(data.email)}</div>
        <div>${escapeHtml(data.addressLine)}</div>
        <div>${escapeHtml(data.cityStateZip)}</div>
      </div>

      <div class="section">
        <div class="label">Items</div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align:right">Qty</th>
              <th style="text-align:right">Price</th>
              <th style="text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>

      <div class="totals">
        <table>
          <tr>
            <td>Subtotal</td>
            <td style="text-align:right">${formatCentsToBRL(
              data.totalPriceInCents,
            )}</td>
          </tr>
          <tr>
            <td>Shipping</td>
            <td style="text-align:right">${formatCentsToBRL(
              data.shippingCostInCents,
            )}</td>
          </tr>
          <tr>
            <td>Total</td>
            <td style="text-align:right">${formatCentsToBRL(
              data.totalPriceInCents + data.shippingCostInCents,
            )}</td>
          </tr>
        </table>
      </div>
    </body>
  </html>
  `;
};

export const generateReceiptPdf = async (data: OrderEmailData) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(buildReceiptHtml(data), {
      waitUntil: "networkidle0",
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,
    });
  } finally {
    await browser.close();
  }
};
